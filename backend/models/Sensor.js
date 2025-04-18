const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: { type: String, required: true }, // Ej: "temperatura", "humedad", "distancia"
  pin: { type: String, required: true },  // Ej: "4", "A0", "3 y A2"
  unidad: { type: String },               // Ej: "°C", "%", "cm"
  proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Sensor', sensorSchema);