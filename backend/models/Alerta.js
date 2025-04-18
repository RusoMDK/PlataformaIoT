const mongoose = require('mongoose');

const alertaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  sensor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: true },
  operador: { type: String, enum: ['>', '<', '>=', '<=', '==', '!='], required: true },
  valor: { type: Number, required: true },
  unidad: { type: String },
  mensaje: { type: String, default: '¡Alerta activada!' },
  activa: { type: Boolean, default: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Alerta', alertaSchema);