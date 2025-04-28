const mongoose = require('mongoose');

const lecturaSchema = new mongoose.Schema({
  sensor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: true },
  valor: { type: Number, required: true },
  unidad: { type: String }, // Opcional, para facilitar lectura rápida
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lectura', lecturaSchema);