// src/realtime/logs.js
const { EventEmitter } = require('events');

const bus = new EventEmitter();

// --- dependencias opcionales (no romper si faltan) ---
let getIO = null;
let getNamespaces = null;
try {
  ({ getIO, getNamespaces } = require('./io'));
} catch { /* opcional */ }

let roomForUser = (id) => `user:${id}`;
try {
  ({ roomForUser } = require('../socketHandlers/dashboardEvents'));
} catch { /* fallback a user:<id> */ }

let sanitizeLogForUser = (doc) => doc;
try {
  ({ sanitizeLogForUser } = require('../utils/redact'));
} catch { /* si no existe, pasa-through */ }

// --- helpers ---
function getDashNs() {
  try {
    const ns = getNamespaces?.();
    if (ns?.dashNs) return ns.dashNs;
    const io = getIO?.();
    return io?.of?.('/dashboard') || io || null;
  } catch {
    return null;
  }
}

// --- API pública ---
function emitUserLog(userId, log, opts = {}) {
  if (!userId || !log) return;
  const uid = String(userId);
  const safe = sanitizeLogForUser(log, opts);

  // EventEmitter interno (por si quieres auditar/enganchar otra cosa)
  bus.emit('log', { userId: uid, log: safe });

  // Socket.IO → sala del usuario
  const ns = getDashNs();
  if (!ns) return;
  try {
    ns.to(roomForUser(uid)).emit('logs:new', safe);
  } catch { /* swallow */ }
}

function emitUserLogs(userId, logs = [], opts = {}) {
  if (!userId || !Array.isArray(logs) || !logs.length) return;
  const uid = String(userId);
  const safe = logs.map((l) => sanitizeLogForUser(l, opts));

  // EventEmitter interno
  bus.emit('logMany', { userId: uid, logs: safe });

  // Socket.IO → lote + compat individual
  const ns = getDashNs();
  if (!ns) return;
  try {
    const room = roomForUser(uid);
    ns.to(room).emit('logs:newMany', { items: safe, total: safe.length });
    for (const it of safe) ns.to(room).emit('logs:new', it);
  } catch { /* swallow */ }
}

// Suscripciones opcionales
function onLog(handler) {
  bus.on('log', handler);
  return () => bus.off('log', handler);
}
function onLogMany(handler) {
  bus.on('logMany', handler);
  return () => bus.off('logMany', handler);
}

module.exports = {
  onLog,
  onLogMany,
  emitUserLog,
  emitUserLogs,
  // aliases por compat
  emitLog:  ({ userId, log,  opts }) => emitUserLog(userId, log, opts),
  emitLogs: ({ userId, logs, opts }) => emitUserLogs(userId, logs, opts),
};
