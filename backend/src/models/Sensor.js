// ✅ MODELO ACTUALIZADO (sensor.model.js)
const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true },
  pin: { type: String, required: true },
  unidad: { type: String },
  proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  protocol: { type: String },
  config: {
    min: Number,
    max: Number,
    frecuencia: Number,
    precision: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Sensor', sensorSchema);