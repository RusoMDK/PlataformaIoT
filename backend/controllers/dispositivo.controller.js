// controllers/dispositivo.controller.js
const Dispositivo = require("../models/Dispositivo");

/*────────────────────────────  POST /api/dispositivos  ────────────────────────────*/
exports.crearDispositivo = async (req, res) => {
  try {
    const { uid, ...rest } = req.body;
    if (!uid) return res.status(400).json({ msg: "UID requerido" });

    /* upsert = crea si no existe, si existe lo actualiza  */
    const dispositivo = await Dispositivo.findOneAndUpdate(
      { uid, usuario: req.usuarioId },
      {
        $set: {
          ...rest,
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
    // índice único (uid+usuario) ya existe → devolvemos 200 OK
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
      { $match: { usuario: req.usuarioId, configurado: true } },
      { $sort:  { ultimaConexion: -1 } },
      { $group: { _id: "$uid", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
    ]);
    res.json(dispositivos);
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener dispositivos" });
  }
};

/*──────────────────────────  PATCH /api/dispositivos/:uid/configurado  ───────────*/
exports.marcarComoConfigurado = async (req, res) => {
  const { uid } = req.params;
  const upd = await Dispositivo.findOneAndUpdate(
    { uid, usuario: req.usuarioId },
    { configurado: true },
    { new: true }
  );
  if (!upd) return res.status(404).json({ msg: "Dispositivo no encontrado" });
  res.json({ msg: "✅ Dispositivo configurado", dispositivo: upd });
};

/*────────────────────────────  GET /verificar/:uid  ──────────────────────────────*/
exports.verificarConexion = async (req, res) => {
  try {
    const { uid } = req.params;
    const dispositivo = await Dispositivo.findOneAndUpdate(
      { uid },
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