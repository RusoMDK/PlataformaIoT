// src/services/logBus.js
const Log = require('../models/Log');
const { roomForUser } = require('../socketHandlers/dashboardEvents');

let dashNs = null;

/** Llamado desde server.js una sola vez, con el namespace '/dashboard' */
function initLogBus(namespace) {
  dashNs = namespace;
}

/** Emite al usuario (si el namespace está listo) */
function emitToUser(usuarioId, payload) {
  if (!dashNs || !usuarioId) return;
  const room = roomForUser(usuarioId);
  dashNs.to(room).emit('logs:new', payload);
}

/**
 * Crea y emite un log (para tiempo real del usuario)
 * params: { usuario, level, module, action, message, detail, ts }
 */
async function createAndEmitLog(params = {}) {
  const doc = await Log.create({
    usuario: params.usuario,
    level:   (params.level || 'info').toLowerCase(),
    module:  (params.module || '').toLowerCase(),
    action:  (params.action || '').toLowerCase(),
    message: params.message || 'log',
    detail:  params.detail ?? null,
    ts:      params.ts ? new Date(params.ts) : new Date(),
  });

  const out = {
    _id: doc._id,
    level: doc.level,
    module: doc.module,
    action: doc.action,
    message: doc.message,
    detail: doc.detail,
    ts: doc.ts,
  };

  emitToUser(doc.usuario, out);
  return out;
}

module.exports = { initLogBus, createAndEmitLog, emitToUser };
