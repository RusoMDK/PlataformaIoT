// src/routes/deviceCommands.routes.js
const express = require('express');
const router = express.Router();

const { getClient } = require('../mqtt/mqttClient');

const requireAuth = require('../middlewares/requireAuth');
const { requireDevice } = require('../middlewares/requireDevice');
const { writeLimiter } = require('../middlewares/ratelimit');
const { idempotency } = require('../middlewares/idempotency');
const { validate, commandSchema } = require('../middlewares/validate');
const DeviceActionLog = require('../models/DeviceActionLog');

/**
 * POST /api/devices/:id/commands
 * headers:
 *   Idempotency-Key: <opcional>
 * body:
 *   { cmd: 'reboot', args: { ... } }
 */
router.post(
  '/devices/:id/commands',
  requireAuth,
  writeLimiter,
  idempotency(),
  validate(commandSchema, 'body'),
  requireDevice, // asegura que :id (uid) pertenece al usuario
  async (req, res) => {
    try {
      const mqtt = getClient();
      if (!mqtt) return res.status(503).json({ error: 'mqtt_unavailable' });

      const tenantId = process.env.TENANT_ID || 'default';
      const deviceId = req.params.id;
      const { cmd, args } = req.body;
      const idempKey = req.get('Idempotency-Key') || undefined;

      const topic = `tenants/${tenantId}/devices/${deviceId}/command`;
      const payload = { _v: 1, cmd, args, ts: Date.now() };

      mqtt.publish(topic, JSON.stringify(payload), { qos: 1 }, async (err) => {
        const accepted = !err;
        // Auditoría
        await DeviceActionLog.create({
          usuario: req.user._id,
          deviceId,
          kind: 'command',
          payload: { cmd, args },
          status: accepted ? 'accepted' : 'rejected',
          reason: accepted ? undefined : String(err),
          requestIp: req.ip,
          idempotencyKey: idempKey
        });

        if (err) return res.status(500).json({ error: 'publish_failed' });
        return res.status(202).json({ ok: true });
      });
    } catch (e) {
      console.error('[command] error', e);
      res.status(500).json({ error: 'server_error' });
    }
  }
);

module.exports = router;
