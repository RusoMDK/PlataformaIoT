const { Types } = require("mongoose");
const Dispositivo = require("../models/Dispositivo");
const mongoose = require("mongoose");

/*────────────────────────────  POST /api/dispositivos  ────────────────────────────*/
exports.crearDispositivo = async (req, res) => {
  try {
    const { uid, ...rest } = req.body;
    if (!uid) return res.status(400).json({ msg: "UID requerido" });

    const uidNormalizado = uid.toLowerCase();

    const dispositivo = await Dispositivo.findOneAndUpdate(
      { uid: uidNormalizado, usuario: new Types.ObjectId(req.usuarioId) },
      {
        $set: {
          ...rest,
          uid: uidNormalizado,
          ultimaConexion: new Date(),
        },
        $setOnInsert: {
          configurado: false,
          creadoEn: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ dispositivo });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ msg: "Dispositivo ya registrado" });
    }
    console.error("❌ Error al registrar dispositivo:", err);
    res.status(500).json({ msg: "Error interno" });
  }
};

/*────────────────────────────  GET /api/dispositivos  ────────────────────────────*/
exports.obtenerDispositivos = async (req, res) => {
  try {
    const dispositivos = await Dispositivo.aggregate([
      { $match: { usuario: new Types.ObjectId(req.usuarioId), configurado: true } },
      { $sort: { ultimaConexion: -1 } },
      { $group: { _id: "$uid", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
    ]);
    res.json(dispositivos);
  } catch (err) {
    console.error("❌ Error al obtener dispositivos:", err);
    res.status(500).json({ msg: "Error al obtener dispositivos" });
  }
};

/*────────────── PATCH /api/dispositivos/:uid/configurado ──────────────*/
exports.marcarComoConfigurado = async (req, res) => {
  try {
    const uid = req.params.uid?.toLowerCase();
    const upd = await Dispositivo.findOneAndUpdate(
      { uid, usuario: new Types.ObjectId(req.usuarioId) },
      { configurado: true },
      { new: true }
    );
    if (!upd) return res.status(404).json({ msg: "Dispositivo no encontrado" });
    res.json({ msg: "✅ Dispositivo configurado", dispositivo: upd });
  } catch (err) {
    console.error("❌ Error al marcar como configurado:", err);
    res.status(500).json({ msg: "Error interno" });
  }
};

/*──────────────────── GET /verificar/:uid ────────────────────*/
exports.verificarConexion = async (req, res) => {
  try {
    const uid = req.params.uid?.toLowerCase();
    const dispositivo = await Dispositivo.findOneAndUpdate(
      { uid, usuario: new Types.ObjectId(req.usuarioId) },
      { ultimaConexion: new Date() },
      { new: true }
    );
    if (!dispositivo)
      return res.status(404).json({ conectado: false, mensaje: "No encontrado" });

    const conectado = Date.now() - dispositivo.ultimaConexion.getTime() < 10000;
    res.json({ conectado });
  } catch (err) {
    console.error("❌ Error verificando conexión:", err);
    res.status(500).json({ conectado: false, mensaje: "Error interno" });
  }
};

/*────────────── PATCH /api/dispositivos/:uid/sensores ──────────────*/
exports.guardarSensoresDispositivo = async (req, res) => {
  try {
    const uid = req.params.uid?.toLowerCase();
    const { sensores } = req.body;

    if (!Array.isArray(sensores)) {
      return res.status(400).json({ msg: "Se espera un array de sensores" });
    }

    const sensoresValidados = sensores.map((s, i) => ({
      id: s.id || crypto.randomUUID(),
      nombre: s.nombre || `Sensor ${i + 1}`,
      tipo: s.tipo || 'desconocido',
      unidad: s.unidad || '',
      pin: s.pin || '',
      configuracion: s.parametros || s.configuracion || {},
      color: s.color || '#cccccc',
    }));

    const dispositivo = await Dispositivo.findOneAndUpdate(
      { uid, usuario: new Types.ObjectId(req.usuarioId) },
      {
        sensores: sensoresValidados,
        configurado: true,
        ultimaConexion: new Date(),
      },
      { new: true }
    );

    if (!dispositivo)
      return res.status(404).json({ msg: "Dispositivo no encontrado" });

    res.json({ msg: "✅ Sensores guardados", dispositivo });
  } catch (err) {
    console.error("❌ Error al guardar sensores:", err);
    res.status(500).json({ msg: "Error interno al guardar sensores" });
  }
};

/*────────────── GET /api/dispositivos/:uid ──────────────*/
exports.obtenerDispositivoPorUid = async (req, res) => {
  try {
    const uid = req.params.uid?.toLowerCase();
    const usuarioObjectId = new mongoose.Types.ObjectId(req.usuarioId);

    console.log("🔎 Buscando con UID:", uid, "Usuario:", usuarioObjectId);

    const dispositivo = await Dispositivo.findOne({
      uid,
      usuario: usuarioObjectId,
    });

    if (!dispositivo) {
      console.log("❌ No se encontró dispositivo para este UID y usuario");
      return res.status(404).json({ msg: "Dispositivo no encontrado" });
    }

    res.json(dispositivo);
  } catch (err) {
    console.error("❌ Error al obtener dispositivo:", err);
    res.status(500).json({ msg: "Error interno" });
  }
};

/*──────────────────── GET /api/dispositivos/raw ────────────────────*/
exports.obtenerTodosLosDispositivos = async (req, res) => {
  try {
    const dispositivos = await Dispositivo.find({
      usuario: new Types.ObjectId(req.usuarioId),
    }).sort({ ultimaConexion: -1 });

    res.json(dispositivos);
  } catch (err) {
    console.error("❌ Error al obtener todos los dispositivos (raw):", err);
    res.status(500).json({ msg: "Error interno" });
  }
};