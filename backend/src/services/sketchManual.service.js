// src/services/sketchManual.service.js

const Dispositivo = require('../models/Dispositivo'); // Ajusta si el nombre real es diferente

// Buscar dispositivo por UID
async function obtenerDispositivoPorUID(uid) {
  return await Dispositivo.findOne({ uid });
}

module.exports = { obtenerDispositivoPorUID };
