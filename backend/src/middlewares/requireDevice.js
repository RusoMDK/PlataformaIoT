// src/middlewares/requireDevice.js
const Dispositivo = require('../models/Dispositivo');

async function requireDevice(req, res, next) {
  try {
    const deviceParam = req.params.id || req.params.uid; // ✅ acepta ambos
    const userId = req.user?._id || req.usuarioId;

    if (!deviceParam) return res.status(400).json({ error: 'deviceId_required' });
    if (!userId)      return res.status(401).json({ error: 'unauthorized' });

    const dev = await Dispositivo.findOne({ uid: deviceParam, usuario: userId }).lean();
    if (!dev) return res.status(404).json({ error: 'device_not_found_or_forbidden' });

    req.device = dev;
    next();
  } catch (e) {
    console.error('[requireDevice] error', e);
    res.status(500).json({ error: 'server_error' });
  }
}

module.exports = { requireDevice };
