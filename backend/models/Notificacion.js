const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, enum: ['alerta', 'sistema', 'lectura'], required: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notificacion', notificacionSchema);