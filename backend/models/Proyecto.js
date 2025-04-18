const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  unidad: { type: String, required: true },
  pin: { type: String, required: true }
}, { _id: false });

const proyectoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  placa: { type: String, required: true },
  sensores: [sensorSchema],
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Proyecto', proyectoSchema);