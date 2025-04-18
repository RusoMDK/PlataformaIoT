// models/Dispositivo.js
const mongoose = require("mongoose");

const dispositivoSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  fabricante: String,
  path: String,
  chip: String,
  vendorId: String,
  productId: String,
  imagen: String,

  /* ───── relación con el dueño ───── */
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },

  /* ───── metadatos ───── */
  ultimaConexion: {
    type: Date,
    default: Date.now,
  },
  creadoEn: {
    type: Date,
    default: Date.now,
  },
  configurado: {
    type: Boolean,
    default: false,
  },
});

/* Índice único compuesto  →  un dispositivo (uid) por usuario */
dispositivoSchema.index({ uid: 1, usuario: 1 }, { unique: true });

module.exports = mongoose.model("Dispositivo", dispositivoSchema);