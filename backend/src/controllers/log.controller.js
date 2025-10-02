// src/controllers/log.controller.js
const mongoose = require('mongoose');
const Log = require('../models/Log');

// Redactor/sanitizador (backend)
let sanitizeLogForUser = (doc) => doc;
try {
  ({ sanitizeLogForUser } = require('../utils/redact'));
} catch { /* fallback: no rompe si falta el módulo */ }

// Realtime (opcional)
let emitUserLog = null;
try {
  ({ emitUserLog } = require('../realtime/logs'));
} catch { /* módulo opcional */ }

/* ============ helpers ============ */
const toDate = (v) => (v ? new Date(v) : null);
const lc = (s) => (typeof s === 'string' ? s.trim().toLowerCase() : '');

/** Normaliza a un shape estable */
function normalize(doc) {
  const d = doc?.toJSON ? doc.toJSON() : doc || {};
  return {
    _id: d._id,
    usuario: d.usuario, // actor (ObjectId)
    level:  lc(d.level) || 'info',
    module: lc(d.module) || '',
    action: lc(d.action) || '',
    message: d.message || d.accion || '',
    detail:  d.detail ?? d.detalle ?? null,
    ts:      d.ts || d.fecha || d.createdAt || d.updatedAt || new Date(),
  };
}

/** Filtro robusto (usuario vs global, rango en ts/fecha/createdAt) */
function buildFilter(q = {}, { currentUserId = null, isAdmin = false } = {}) {
  const and = [];

  // En "mis logs", restringir por actor
  if (!isAdmin && currentUserId) and.push({ usuario: currentUserId });

  const L = lc(q.level);
  const M = lc(q.module);
  const A = lc(q.action);
  const textQ = (q.q || '').toString().trim();
  const from = toDate(q.from);
  const to   = toDate(q.to);

  if (L) {
    if (L === 'info') {
      and.push({ $or: [{ level: 'info' }, { level: { $exists: false } }, { level: null }] });
    } else {
      and.push({ level: L });
    }
  }
  if (M) and.push({ module: M });
  if (A) and.push({ action: A });

  if (from || to) {
    const r = {};
    if (from) r.$gte = from;
    if (to)   r.$lte = to;
    // cubrir docs antiguos sin ts
    and.push({ $or: [{ ts: r }, { fecha: r }, { createdAt: r }] });
  }

  if (textQ) {
    const hasTextIndex = Log.schema.indexes().some(([idx]) =>
      idx && (idx.message === 'text' || idx.action === 'text' || idx.module === 'text')
    );
    if (hasTextIndex) {
      and.push({ $text: { $search: textQ } });
    } else {
      const rx = new RegExp(textQ, 'i');
      and.push({ $or: [{ message: rx }, { action: rx }, { module: rx }] });
    }
  }

  return and.length ? { $and: and } : {};
}

function parsePaging(q) {
  const page = Math.max(parseInt(q.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(q.pageSize || '20', 10), 1), 200);
  return { page, pageSize, skip: (page - 1) * pageSize, limit: pageSize };
}

function parseSort(q) {
  // campos permitidos por seguridad
  const ALLOW = new Set(['ts', 'level', 'module', 'action', '_id']);
  const raw = String(q.sort || 'ts:desc');
  const [sfRaw, sdRaw] = raw.split(':');
  const sf = ALLOW.has(sfRaw) ? sfRaw : 'ts';
  const sd = sdRaw === 'asc' ? 1 : -1;
  return { [sf]: sd };
}

/* ============ HANDLERS ============ */

// GET /api/logs  (alias: /api/logs/usuario) → Mis logs
exports.obtenerLogs = async (req, res) => {
  try {
    const filter = buildFilter(req.query, { currentUserId: req.usuarioId, isAdmin: false });
    const { page, pageSize, skip, limit } = parsePaging(req.query);
    const sort = parseSort(req.query);

    const [rows, total] = await Promise.all([
      Log.find(filter).sort(sort).skip(skip).limit(limit),
      Log.countDocuments(filter),
    ]);

    // Sanear SIEMPRE antes de responder
    const safe = rows.map((d) => sanitizeLogForUser(normalize(d), { isAdmin: false }));

    res.json({ items: safe, total, page, pageSize });
  } catch (err) {
    console.error('obtenerLogs error:', err);
    res.status(500).json({ msg: 'Error al obtener logs' });
  }
};

// GET /api/logs/globales  (admin)
exports.obtenerLogsGlobales = async (req, res) => {
  try {
    const filter = buildFilter(req.query, { isAdmin: true });
    const { page, pageSize, skip, limit } = parsePaging(req.query);
    const sort = parseSort(req.query);

    const [rows, total] = await Promise.all([
      Log.find(filter).sort(sort).skip(skip).limit(limit).populate('usuario', 'nombre email'),
      Log.countDocuments(filter),
    ]);

    const safe = rows.map((d) => sanitizeLogForUser(normalize(d), { isAdmin: true }));

    res.json({ items: safe, total, page, pageSize });
  } catch (err) {
    console.error('obtenerLogsGlobales error:', err);
    res.status(500).json({ msg: 'Error al obtener logs globales' });
  }
};

// GET /api/logs/export.csv  (mis logs, saneado)
exports.exportarCSV = async (req, res) => {
  try {
    const filter = buildFilter(req.query, { currentUserId: req.usuarioId, isAdmin: false });
    const rows = await Log.find(filter).sort({ ts: -1 }).limit(5000).lean();

    const safe = rows.map((r) => sanitizeLogForUser(normalize(r), { isAdmin: false }));

    const header = ['_id', 'ts', 'level', 'module', 'action', 'message'];
    const csv = [
      header.join(','),
      ...safe.map((n) => [
        n._id,
        new Date(n.ts).toISOString(),
        (n.level || '').replace(/,/g, ' '),
        (n.module || '').replace(/,/g, ' '),
        (n.action || '').replace(/,/g, ' '),
        (n.message || '').replace(/[\r\n,]+/g, ' '),
      ].join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="logs-${new Date().toISOString().slice(0,10)}.csv"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error('exportarCSV error:', err);
    res.status(500).json({ msg: 'Error al exportar logs' });
  }
};

// POST /api/logs/eliminar-varios  (solo mis logs)
exports.eliminarVariosLogs = async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ msg: 'Debes enviar un array de IDs.' });
    }
    const valid = ids.filter((id) => mongoose.isValidObjectId(id));
    if (!valid.length) return res.status(400).json({ msg: 'IDs inválidos.' });

    const result = await Log.deleteMany({ _id: { $in: valid }, usuario: req.usuarioId });
    res.json({ ok: true, deleted: result.deletedCount || 0 });
  } catch (err) {
    console.error('eliminarVariosLogs error:', err);
    res.status(500).json({ msg: 'Error al eliminar logs' });
  }
};

// POST /api/logs  → crea log para el actor (pruebas/tools)
exports.crearLogManual = async (req, res) => {
  try {
    const b = req.body || {};
    const actorId = req.usuarioId;

    const doc = await Log.create({
      usuario: actorId,
      level:  lc(b.level)  || undefined,
      module: lc(b.module) || undefined,
      action: lc(b.action) || undefined,
      message: b.message || b.accion || '',
      detail:  b.detail  ?? b.detalle ?? null,
      ts: b.ts || b.fecha || new Date(),
    });

    const norm = normalize(doc);
    const safe = sanitizeLogForUser(norm, { isAdmin: false });

    // realtime opcional (si el emisor también sanea, esto es idempotente)
    if (emitUserLog) {
      try { await emitUserLog(String(actorId), safe); } catch {}
    }

    res.status(201).json(safe);
  } catch (err) {
    console.error('crearLogManual error:', err);
    res.status(400).json({ msg: 'Error al crear log' });
  }
};

// Helper para registrar log del actor desde otros módulos
exports.registerLog = async (payload = {}, actorId) => {
  try {
    const doc = await Log.create({
      usuario: actorId || payload.usuario,
      level:  lc(payload.level)  || undefined,
      module: lc(payload.module) || undefined,
      action: lc(payload.action) || undefined,
      message: payload.message || '',
      detail:  payload.detail  ?? null,
      ts: payload.ts || new Date(),
    });

    const norm = normalize(doc);
    const safe = sanitizeLogForUser(norm, { isAdmin: false });

    if (emitUserLog) {
      try { await emitUserLog(String(doc.usuario), safe); } catch {}
    }
    return doc;
  } catch (err) {
    console.error('registerLog error:', err);
    return null;
  }
};
