const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },

    // Texto principal
    mensaje: { type: String, required: true, trim: true },

    // Clasificación (flexible)
    tipo: { type: String, default: 'info', lowercase: true, trim: true },     // p.ej. info|alerta|error|device|alert
    severity: { type: String, default: '', lowercase: true, trim: true },     // low|med|high|critical (opcional)

    // Estado en DB
    leido: { type: Boolean, default: false },

    // Contexto extra (opcionales)
    deviceId: { type: String, default: '' },
    project:  { type: String, default: '' },
    detalle:  { type: mongoose.Schema.Types.Mixed, default: null },

    // Tiempos
    timestamp: { type: Date, default: Date.now, index: true }, // preferido por el frontend
    creadoEn:  { type: Date, default: Date.now },              // compat
  },
  { timestamps: true }
);

// Virtual 'leida' (expone el nombre que usa el FE)
NotificacionSchema.virtual('leida')
  .get(function () { return this.leido; })
  .set(function (v) { this.leido = !!v; });

// Incluir virtuales al serializar (para res.json)
NotificacionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  }
});

// Índices recomendados
NotificacionSchema.index({ usuario: 1, leido: 1, timestamp: -1 });

// ✅ Evita OverwriteModelError en recargas/require múltiples
module.exports = mongoose.models.Notificacion || mongoose.model('Notificacion', NotificacionSchema);
