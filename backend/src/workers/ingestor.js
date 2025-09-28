const mqtt = require('../mqtt/mqttClient'); // tu instancia conectada
const Dispositivo = require('../models/Dispositivo');
const Lectura = require('../models/Lectura'); // asumo que tienes este modelo
const { validateTelemetry } = require('../services/validators');
const dayjs = require('dayjs');

// Suscríbete al patrón global (ajústalo si usas org/owner):
const SUB = 'iot/+/+/+/telemetry/#';

function parseTopic(topic) {
  // iot/<owner>/<projectId>/<deviceId>/telemetry/<sensorId>
  const parts = topic.split('/');
  if (parts.length < 6) return null;
  const owner = parts[1];
  const projectId = parts[2];
  const deviceId = parts[3];
  const kind = parts[4]; // telemetry
  const tail = parts.slice(5).join('/');
  return { owner, projectId, deviceId, kind, tail };
}

async function handleTelemetry(owner, projectId, deviceId, payload, sensorIdInline) {
  let data;
  try { data = JSON.parse(payload.toString()); }
  catch { return; }

  const dev = await Dispositivo.findById(deviceId);
  if (!dev) return;

  // normalizar a array
  const records = Array.isArray(data) ? data : [data];
  const docs = [];
  for (const rec of records) {
    const obj = { ...rec };
    if (!obj.sensorId && sensorIdInline) obj.sensorId = sensorIdInline;

    const ok = validateTelemetry(obj);
    if (!ok) continue;

    const ts = typeof obj.ts === 'number' ? new Date(obj.ts) : new Date();
    docs.push({
      projectId,
      deviceId,
      sensorId: obj.sensorId || 'unknown',
      ts,
      value: obj.value,
      unit: obj.unit,
      meta: obj.meta || {}
    });
  }
  if (docs.length) {
    await Lectura.insertMany(docs, { ordered: false }).catch(()=>{});
    // presencia básica
    dev.estado.online = true;
    dev.estado.lastSeen = new Date();
    await dev.save().catch(()=>{});
  }
}

function startIngestor() {
  mqtt.subscribe(SUB, { qos: 1 }, (err)=> {
    if (err) console.error('[INGESTOR] subscribe error', err);
    else console.log('[INGESTOR] suscrito a', SUB);
  });

  mqtt.on('message', async (topic, payload) => {
    const info = parseTopic(topic);
    if (!info || info.kind !== 'telemetry') return;

    // sensor en path (p.ej., telemetry/temp) o batch (_batch)
    const sensorTail = info.tail; // e.g. "temp" | "_batch"
    const inlineSensor = sensorTail !== '_batch' ? sensorTail : null;

    try {
      await handleTelemetry(info.owner, info.projectId, info.deviceId, payload, inlineSensor);
    } catch (e) {
      console.error('[INGESTOR] handle error', e);
    }
  });
}

module.exports = { startIngestor };
