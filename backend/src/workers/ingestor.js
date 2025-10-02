// src/workers/ingestor.js
const { getClient } = require('../mqtt/mqttClient');
const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura');
const { validateTelemetry } = require('../services/validators');
const dayjs = require('dayjs');

// ¿Los schemas tienen tenantId?
const HAS_TENANT_DISP = !!Dispositivo.schema.path('tenantId');
const HAS_TENANT_LECT = !!Lectura.schema?.path?.('tenantId');

// Suscripciones: legacy y nuevo esquema
const SUB_LEGACY  = 'iot/+/+/+/telemetry/#';            // iot/<owner>/<projectId>/<deviceId>/telemetry/<sensorId>
const SUB_TENANTS = 'tenants/+/devices/+/telemetry/#';  // tenants/<tenantId>/devices/<deviceId>/telemetry/<sensorId|_batch'

// ---------- Helpers de parse ----------
function parseTopicLegacy(topic) {
  const p = topic.split('/');
  if (p.length < 6) return null;
  return {
    schema: 'legacy',
    owner: p[1],
    projectId: p[2],
    deviceId: p[3],
    kind: p[4],                 // 'telemetry'
    tail: p.slice(5).join('/'), // sensorId o '_batch'
    tenantId: null
  };
}

function parseTopicTenants(topic) {
  const p = topic.split('/');
  if (p.length < 6) return null;
  return {
    schema: 'tenants',
    tenantId: p[1],
    owner: null,
    projectId: null,
    deviceId: p[3],
    kind: p[4],                 // 'telemetry'
    tail: p.slice(5).join('/'), // sensorId o '_batch' o '' si fue .../telemetry "pelado"
  };
}

function parseTopic(topic) {
  if (topic.startsWith('tenants/')) return parseTopicTenants(topic);
  if (topic.startsWith('iot/'))     return parseTopicLegacy(topic);
  return null;
}

// ---------- Ingesta ----------
async function handleTelemetry({ owner, projectId, tenantId, deviceId, payloadBuf, sensorIdInline }) {
  let data;
  try { data = JSON.parse(payloadBuf.toString()); } catch { return; }

  const records = Array.isArray(data) ? data : [data];
  const docs = [];

  // Localiza el dispositivo (sin romper strict)
  const dispFilter = { uid: deviceId };
  if (HAS_TENANT_DISP && tenantId) dispFilter.tenantId = tenantId;

  const dev = tenantId
    ? await Dispositivo.findOne(dispFilter)
    : await Dispositivo.findOne({ uid: deviceId }) || await Dispositivo.findById(deviceId); // fallback legacy
  if (!dev) return;

  for (const rec of records) {
    const obj = { ...rec };
    if (!obj.sensorId && sensorIdInline) obj.sensorId = sensorIdInline;

    const ok = validateTelemetry(obj);
    if (!ok) continue;

    const ts = typeof obj.ts === 'number' ? new Date(obj.ts) : new Date();
    const baseDoc = {
      projectId: projectId || dev.projectId || null,
      deviceId,
      sensorId: obj.sensorId || 'unknown',
      ts,
      value: obj.value,
      unit: obj.unit,
      meta: obj.meta || {}
    };
    if (HAS_TENANT_LECT && tenantId) baseDoc.tenantId = tenantId;

    docs.push(baseDoc);
  }

  if (docs.length) {
    await Lectura.insertMany(docs, { ordered: false }).catch(() => {});
    // presencia básica en el dispositivo
    dev.estado = dev.estado || {};
    dev.estado.online = true;
    dev.estado.lastSeen = new Date();
    await dev.save().catch(() => {});
  }
}

function startIngestor() {
  const mqtt = getClient();

  if (!mqtt || typeof mqtt.subscribe !== 'function') {
    console.error('[INGESTOR] MQTT client no inicializado. Asegúrate de llamar initMQTTListener() antes de startIngestor().');
    return;
  }

  mqtt.subscribe([SUB_LEGACY, SUB_TENANTS], { qos: 1 }, (err) => {
    if (err) console.error('[INGESTOR] subscribe error', err);
    else     console.log('[INGESTOR] suscrito a iot/+/+/+/telemetry/# y tenants/+/devices/+/telemetry/#');
  });

  mqtt.on('message', async (topic, payload) => {
    // Acepta .../telemetry y .../telemetry/<algo>
    if (!/\/telemetry(?:\/|$)/.test(topic)) return;

    const info = parseTopic(topic);
    if (!info || info.kind !== 'telemetry') return;

    const sensorTail   = info.tail || '';           // '' si fue .../telemetry
    const inlineSensor = (sensorTail && sensorTail !== '_batch') ? sensorTail : null;

    try {
      await handleTelemetry({
        owner: info.owner,
        projectId: info.projectId,
        tenantId: info.tenantId,
        deviceId: info.deviceId,
        payloadBuf: payload,
        sensorIdInline: inlineSensor
      });
      console.log('[INGESTOR] ok →', topic);
    } catch (e) {
      console.error('[INGESTOR] handle error', e);
    }
  });
}

module.exports = { startIngestor };
