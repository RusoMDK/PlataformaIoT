// src/mqtt/mqttClient.js
const mqtt = require('mqtt');
const Dispositivo = require('../models/Dispositivo');

const MQTT_URL  = process.env.MQTT_URL  || 'mqtt://localhost:1883';
const TENANT_ID = process.env.TENANT_ID || 'default';

// ¿tu schema tiene tenantId? (hoy normalmente NO)
const HAS_TENANT = !!Dispositivo.schema.path('tenantId');

// Topics locales
const TOPICS = [
  'tenants/+/devices/+/state',            // "online" | "offline" (retain + LWT)
  'tenants/+/devices/+/telemetry',        // JSON: { ts, metrics{}, meta{}, _v }
  'tenants/+/devices/+/shadow/reported',  // JSON: { _v, reported{...} } → solo emit/log
  'devices/heartbeat/+'                   // compat anterior (uid en el topic)
];

let client = null;
// refs opcionales de socket
let ioRef = null;
let dashNsRef = null;
let agentNsRef = null;

function getClient() {
  return client;
}

/**
 * initMQTTListener({ io, dashNs, agentNs }?)
 * - Puedes pasar namespaces si quieres emitir al mapa en tiempo real
 */
function initMQTTListener(opts = {}) {
  if (client) return client; // idempotente

  ioRef = opts.io || null;
  dashNsRef = opts.dashNs || null;
  agentNsRef = opts.agentNs || null;

  client = mqtt.connect(MQTT_URL, {
    clientId: `backend-${Math.random().toString(16).slice(2)}`,
    clean: true,
    reconnectPeriod: 2000
  });

  client.on('connect', () => {
    console.log(`📡 Conectado al broker MQTT en ${MQTT_URL}`);
    client.subscribe(TOPICS, (err) => {
      if (err) return console.error('❌ Error al suscribirse a topics MQTT:', err);
      console.log('🔔 Suscrito a:', TOPICS.join(', '));
    });
  });

  client.on('message', async (topic, message) => {
    const txt = message?.toString?.() ?? '';
    const parts = topic.split('/');

    try {
      // tenants/{tenantId}/devices/{deviceId}/{kind}/{subkind?}
      if (parts[0] === 'tenants') {
        const tenantId = parts[1];
        const deviceId = parts[3];
        const kind     = parts[4];
        const subkind  = parts[5];
        const nowTs    = Date.now();

        // filtro DB compatible con schemas sin tenantId
        const filter = { uid: deviceId };
        if (HAS_TENANT) filter.tenantId = tenantId;

        if (kind === 'state') {
          const stateTxt = (safeParse(txt) ?? txt)?.toString().toLowerCase();
          const online = stateTxt === 'online';
          console.log('[MQTT] state', deviceId, '→', stateTxt);

          await Dispositivo.updateOne(
            filter,
            { $set: { 'estado.online': online, 'estado.lastSeen': new Date(), ultimaConexion: new Date() } },
            { upsert: true }
          );

          // 🔴 emit en tiempo real al dashboard
          if (dashNsRef) dashNsRef.emit('device:state', { deviceId, online, ts: nowTs });
        }

        else if (kind === 'telemetry') {
          const payload = safeParse(txt);
          if (!payload) return;

          const set = {
            ultimaConexion: new Date(),
            'estado.lastSeen': new Date()
          };
          if (payload?.meta?.fw) set['estado.fw'] = payload.meta.fw;

          console.log('[MQTT] telemetry', deviceId, payload.metrics || {});
          await Dispositivo.updateOne(filter, { $set: set }, { upsert: true });

          // 🟢 emit en tiempo real al dashboard
          if (dashNsRef) {
            dashNsRef.emit('device:telemetry', {
              deviceId,
              metrics: payload.metrics || {},
              meta: payload.meta || {},
              ts: payload.ts ?? Date.now()
            });
          }
        }

        else if (kind === 'shadow' && subkind === 'reported') {
          const payload = safeParse(txt);
          console.log('[MQTT] shadow.reported', deviceId, payload?.reported);

          // (opcional) emite al dashboard para UI's que muestren config/reportes
          if (dashNsRef) {
            dashNsRef.emit('device:shadow:reported', {
              deviceId,
              reported: payload?.reported,
              _v: payload?._v
            });
          }
          // No persistimos en DB porque tu schema actual no tiene "shadow".
        }
      }

      // Compat: devices/heartbeat/{uid}
      else if (parts[0] === 'devices' && parts[1] === 'heartbeat') {
        const uid = parts[2];
        const ip  = txt;
        const nowTs = Date.now();

        console.log('[MQTT] heartbeat', uid, '→', ip);
        await Dispositivo.updateOne(
          { uid },
          { $set: { ipUltimaConexion: ip, 'estado.lastSeen': new Date(), ultimaConexion: new Date() } },
          { upsert: true }
        );

        // 🟡 emit opcional (puede servir para mapa rápido)
        if (dashNsRef) dashNsRef.emit('device:heartbeat', { deviceId: uid, ip, ts: nowTs });
      }
    } catch (error) {
      console.error('❌ Error procesando mensaje MQTT:', topic, error);
    }
  });

  client.on('error', (err) => {
    console.error('❌ Error MQTT:', err);
  });

  return client;
}

function safeParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

module.exports = { initMQTTListener, getClient };
