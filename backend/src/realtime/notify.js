// src/realtime/notify.js
const { getDashNs } = require('./io');
const Notificacion = require('../models/notificacion');

// Normaliza doc para el FE
function mapDoc(n) {
  return {
    _id: n._id,
    mensaje: n.mensaje,
    leida: typeof n.leido === 'boolean' ? n.leido : !!n.leida,
    tipo: n.tipo || '',
    severity: n.severity || '',
    deviceId: n.deviceId || '',
    project: n.project || '',
    detalle: n.detalle ?? null,
    timestamp: n.timestamp || n.creadoEn || n.createdAt,
  };
}

function roomForUser(userId) {
  return `user:${userId}`;
}

/** Emite el conteo de no leídas al usuario */
async function emitUnreadCount(userId) {
  const dash = getDashNs();
  if (!dash) return;
  const count = await Notificacion.countDocuments({ usuario: userId, leido: false });
  dash.to(roomForUser(userId)).emit('notifications:unread-count', { count });
}

/** Emite una notificación nueva al usuario (y refresca el conteo) */
async function emitNewNotification(userId, notifDocOrPlain) {
  const dash = getDashNs();
  if (!dash) return;

  const payload = mapDoc(notifDocOrPlain);
  dash.to(roomForUser(userId)).emit('notifications:new', payload);
  await emitUnreadCount(userId);
}

/** Emite una actualización (ids marcadas como leídas) y refresca conteo */
async function emitReadUpdate(userId, ids = []) {
  const dash = getDashNs();
  if (!dash) return;
  dash.to(roomForUser(userId)).emit('notifications:read', { ids });
  await emitUnreadCount(userId);
}

module.exports = {
  mapDoc,
  emitUnreadCount,
  emitNewNotification,
  emitReadUpdate,
};
