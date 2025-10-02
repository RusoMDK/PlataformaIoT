// src/routes/deviceDesired.routes.js
const express = require('express');
const router = express.Router();

const { getClient } = require('../mqtt/mqttClient');

const requireAuth = require('../middlewares/requireAuth');
const { requireDevice } = require('../middlewares/requireDevice');
const { writeLimiter } = require('../middlewares/ratelimit');
const { idempotency } = require('../middlewares/idempotency');
const { validate, desiredSchema } = require('../middlewares/validate');
const DeviceActionLog = require('../models/DeviceActionLog');

/**
 * POST /api/devices/:id/desired
 * headers:
 *   Idempotency-Key: <opcional>
 * body:
 *   { desired: { pumpOn: true, ... } }
 */
router.post(
  '/devices/:id/desired',
  requireAuth,
  writeLimiter,
  idempotency(),
  validate(desiredSchema, 'body'),
  requireDevice, // asegura que :id (uid) pertenece al usuario
  async (req, res) => {
    try {
      const mqtt = getClient();
      if (!mqtt) return res.status(503).json({ error: 'mqtt_unavailable' });

      const tenantId = process.env.TENANT_ID || 'default';
      const deviceId = req.params.id;
      const { desired } = req.body;
      const idempKey = req.get('Idempotency-Key') || undefined;

      const topic = `tenants/${tenantId}/devices/${deviceId}/shadow/desired`;
      const payload = { _v: 1, desired };

      mqtt.publish(topic, JSON.stringify(payload), { qos: 1 }, async (err) => {
        const accepted = !err;
        // Auditoría
        await DeviceActionLog.create({
          usuario: req.user._id,
          deviceId,
          kind: 'desired',
          payload: desired,
          status: accepted ? 'accepted' : 'rejected',
          reason: accepted ? undefined : String(err),
          requestIp: req.ip,
          idempotencyKey: idempKey
        });

        if (err) return res.status(500).json({ error: 'publish_failed' });
        return res.json({ ok: true });
      });
    } catch (e) {
      console.error('[desired] error', e);
      res.status(500).json({ error: 'server_error' });
    }
  }
);

module.exports = router;
