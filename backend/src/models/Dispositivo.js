const mongoose = require("mongoose");

const dispositivoSchema = new mongoose.Schema({
  uid: { type: String, required: true, lowercase: true }, // ✅ normaliza
  nombre: { type: String, required: true },
  fabricante: { type: String, default: "Desconocido" },
  path: { type: String },
  chip: { type: String },
  vendorId: { type: String },
  productId: { type: String },
  imagen: { type: String, default: "generic.png" },

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },

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

  sensores: [
    {
      id: String,
      nombre: String,
      tipo: String,
      unidad: String,
      pin: String,
      configuracion: Object,
    },
  ],
});

// ✅ Evitar duplicados por usuario + uid
dispositivoSchema.index({ uid: 1, usuario: 1 }, { unique: true });

// ✅ También puedes garantizar que uid sea único global (si lo deseas)
// dispositivoSchema.index({ uid: 1 }, { unique: true });

// ✅ Registrar fecha de actualización automática
dispositivoSchema.pre("save", function (next) {
  this.ultimaConexion = new Date();
  next();
});

module.exports = mongoose.model("Dispositivo", dispositivoSchema);