// models/Visualizacion.js
const mongoose = require('mongoose');

const visualizacionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  titulo: { type: String, required: true },
  tipo: { type: String, required: true },
  sensores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' }],
  orden: { type: Number, default: 0 },
  color: { type: String, default: '#8884d8' },
  ejeX: { type: String, default: 'timestamp' },
  ejeY: { type: String, default: 'valor' },
  mostrarLeyenda: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Visualizacion', visualizacionSchema);