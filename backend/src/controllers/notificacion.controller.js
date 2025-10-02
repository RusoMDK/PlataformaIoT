// src/controllers/notificacion.controller.js
const mongoose = require('mongoose');
const Notificacion = require('../models/notificacion');
const {
  mapDoc,
  emitUnreadCount,
  emitNewNotification,
  emitReadUpdate,
} = require('../realtime/notify');

const toBool = (v) => {
  if (v === true || v === false) return v;
  if (typeof v !== 'string') return undefined;
  const s = v.trim().toLowerCase();
  if (s === 'true') return true;
  if (s === 'false') return false;
  return undefined;
};

exports.obtenerNotificaciones = async (req, res) => {
  try {
    const page = parseInt(req.query.page || req.query.pagina || '1', 10);
    const pageSize = parseInt(req.query.pageSize || req.query.limite || '20', 10);
    const { tipo, severity, q } = req.query;
    const leida = toBool(req.query.leida);

    const filter = { usuario: req.usuarioId };
    if (typeof leida === 'boolean') filter.leido = leida;
    if (tipo) filter.tipo = String(tipo).toLowerCase().trim();
    if (severity) filter.severity = String(severity).toLowerCase().trim();

    if (q && String(q).trim()) {
      const regex = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ mensaje: regex }, { deviceId: regex }, { project: regex }];
    }

    const limit = Math.min(Math.max(pageSize, 1), 100);
    const skip = Math.max((page - 1) * limit, 0);

    const [rows, total] = await Promise.all([
      Notificacion.find(filter)
        .sort({ timestamp: -1, creadoEn: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notificacion.countDocuments(filter),
    ]);

    res.status(200).json({
      items: rows.map(mapDoc),
      total,
      page,
      pageSize: limit,
    });
  } catch (err) {
    console.error('obtenerNotificaciones error:', err);
    res.status(500).json({ msg: 'Error al obtener notificaciones' });
  }
};

exports.obtenerNoLeidasCount = async (req, res) => {
  try {
    const count = await Notificacion.countDocuments({ usuario: req.usuarioId, leido: false });
    res.json({ count });
  } catch (err) {
    console.error('obtenerNoLeidasCount error:', err);
    res.status(500).json({ msg: 'Error al contar no leídas' });
  }
};

exports.crearNotificacion = async (req, res) => {
  try {
    const b = req.body || {};
    const doc = await Notificacion.create({
      usuario:  req.usuarioId,
      mensaje:  b.mensaje || b.message || 'Notificación',
      detalle:  b.detalle ?? b.detail ?? b.meta ?? null,
      tipo:     (b.tipo || 'info').toLowerCase(),
      severity: (b.severity || '').toLowerCase(),
      deviceId: b.deviceId || '',
      project:  b.project  || '',
      timestamp: b.timestamp ? new Date(b.timestamp) : new Date(),
      leido: !!b.leida || !!b.leido || false,
    });

    const plain = doc.toObject();
    res.status(201).json(mapDoc(plain));

    // 🔴 push en tiempo real
    emitNewNotification(req.usuarioId, plain).catch(() => {});
  } catch (err) {
    console.error('crearNotificacion error:', err);
    res.status(400).json({ msg: 'Error al crear notificación' });
  }
};

exports.marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: 'ID inválido' });
    }

    const result = await Notificacion.updateOne(
      { _id: id, usuario: req.usuarioId },
      { $set: { leido: true } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ msg: 'Notificación no encontrada' });
    }

    res.status(200).json({ ok: true });

    // 🔴 push en tiempo real (ids leídas + refresco de conteo)
    emitReadUpdate(req.usuarioId, [id]).catch(() => {});
  } catch (err) {
    console.error('marcarComoLeida error:', err);
    res.status(500).json({ msg: 'Error al marcar como leída' });
  }
};

exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    const result = await Notificacion.updateMany(
      { usuario: req.usuarioId, leido: false },
      { $set: { leido: true } }
    );
    res.status(200).json({ ok: true, updated: result.modifiedCount || 0 });

    // 🔴 push en tiempo real: solo refrescamos el conteo
    emitUnreadCount(req.usuarioId).catch(() => {});
  } catch (err) {
    console.error('marcarTodasComoLeidas error:', err);
    res.status(500).json({ msg: 'Error al marcar todas como leídas' });
  }
};

exports.marcarVariasComoLeidas = async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ msg: 'Se requiere "ids" (array)' });
    }

    const validIds = ids.filter((x) => mongoose.isValidObjectId(x));
    if (!validIds.length) return res.status(400).json({ msg: 'IDs inválidos' });

    const result = await Notificacion.updateMany(
      { _id: { $in: validIds }, usuario: req.usuarioId },
      { $set: { leido: true } }
    );

    res.status(200).json({ ok: true, updated: result.modifiedCount || 0 });

    // 🔴 push en tiempo real
    emitReadUpdate(req.usuarioId, validIds).catch(() => {});
  } catch (err) {
    console.error('marcarVariasComoLeidas error:', err);
    res.status(500).json({ msg: 'Error en marcado masivo' });
  }
};
