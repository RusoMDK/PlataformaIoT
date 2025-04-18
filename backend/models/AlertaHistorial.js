const mongoose = require('mongoose');

const alertaHistorialSchema = new mongoose.Schema({
  alerta: { type: mongoose.Schema.Types.ObjectId, ref: 'Alerta', required: true },
  sensor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  valor: { type: Number, required: true },
  unidad: { type: String },
  mensaje: { type: String },
  timestamp: { type: Date, default: Date.now },
  resuelta: { type: Boolean, default: false },
  vista: { type: Boolean, default: false }
});

module.exports = mongoose.model('AlertaHistorial', alertaHistorialSchema);