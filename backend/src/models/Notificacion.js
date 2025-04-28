const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  mensaje: { type: String, required: true },
  tipo: { type: String, enum: ['info', 'alerta', 'error'], default: 'info' },
  leido: { type: Boolean, default: false },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notificacion', notificacionSchema);