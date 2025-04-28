const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  accion: { type: String, required: true },
  detalle: { type: String },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);