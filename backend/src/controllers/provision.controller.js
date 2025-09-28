const Dispositivo = require('../models/Dispositivo');
const Proyecto = require('../models/Proyecto'); // asumiendo que existe
const { sha256Base64, randomToken } = require('../utils/hash');
const bcrypt = require('bcryptjs');

function deviceUsername(projectId, deviceId) {
  return `p:${String(projectId)}:d:${String(deviceId)}`;
}

async function createClaim(req, res) {
  try {
    const { projectId, name, meta } = req.body;
    const userId = req.user._id; // viene de auth usuario
    const project = await Proyecto.findOne({ _id: projectId, owner: userId });
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

    const claimToken = randomToken(24);
    const claimTokenHash = sha256Base64(claimToken);
    const expiresAt = new Date(Date.now() + 1000*60*15); // 15 min

    const dev = await Dispositivo.create({
      projectId,
      nombre: name || 'device',
      meta: meta || {},
      provision: {
        status: 'pending',
        claimTokenHash,
        claimExpiresAt: expiresAt
      }
    });

    return res.json({
      deviceId: dev._id,
      claimToken,
      expiresAt
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'createClaim failed' });
  }
}

async function registerDevice(req, res) {
  try {
    // Llega del dispositivo (sin auth de usuario)
    const { claimToken, deviceId, uid, hw, fw, meta } = req.body;
    if (!claimToken || !deviceId || !uid) {
      return res.status(400).json({ error: 'claimToken, deviceId, uid requeridos' });
    }
    const dev = await Dispositivo.findById(deviceId).populate('projectId');
    if (!dev) return res.status(404).json({ error: 'device not found' });
    if (dev.provision.status !== 'pending') {
      return res.status(400).json({ error: 'invalid status' });
    }
    if (!dev.provision.claimExpiresAt || dev.provision.claimExpiresAt < new Date()) {
      return res.status(400).json({ error: 'claim expired' });
    }
    const ok = (sha256Base64(claimToken) === dev.provision.claimTokenHash);
    if (!ok) return res.status(403).json({ error: 'invalid claim token' });

    // Generar credenciales MQTT
    const username = deviceUsername(dev.projectId._id, dev._id);
    const plainPass = randomToken(16);
    const passwordHash = await bcrypt.hash(plainPass, 10);

    dev.uid = uid;
    dev.meta = { ...(dev.meta||{}), hw, fw, ...(meta||{}) };
    dev.provision.status = 'active';
    dev.provision.claimTokenHash = null;
    dev.provision.claimExpiresAt = null;
    dev.provision.credentials = {
      type: 'mqtt',
      username,
      passwordHash,
      createdAt: new Date()
    };
    await dev.save();

    // Config MQTT devuelto al dispositivo (ajusta host/port/tls desde config)
    const mqtt = {
      host: process.env.MQTT_HOST || 'localhost',
      port: Number(process.env.MQTT_PORT || 1883),
      tls: !!Number(process.env.MQTT_TLS || 0),
      username,
      password: plainPass,
      baseTopic: `iot/${dev.projectId.owner || 'user'}/${dev.projectId._id}/${dev._id}` // puedes cambiar 'owner' por tu propiedad
    };

    return res.json({
      deviceId: dev._id,
      mqtt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'registerDevice failed' });
  }
}

async function heartbeat(req, res) {
  try {
    const { deviceId, ip, rssi, fw } = req.body;
    const dev = await Dispositivo.findById(deviceId);
    if (!dev) return res.status(404).json({ error: 'device not found' });

    dev.estado.online = true;
    dev.estado.lastSeen = new Date();
    if (ip) dev.estado.ip = ip;
    if (typeof rssi === 'number') dev.estado.rssi = rssi;
    if (fw) dev.estado.fw = fw;
    await dev.save();

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'heartbeat failed' });
  }
}

module.exports = { createClaim, registerDevice, heartbeat };
