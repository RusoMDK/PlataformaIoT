// helpers/registrarLog.js
const Log = require("../models/Log");

const registrarLog = async (usuarioId, accion, detalle = "") => {
  try {
    await Log.create({
      usuario: usuarioId,
      accion,
      detalle,
    });
  } catch (err) {
    console.error("❌ Error al registrar log:", err);
  }
};

module.exports = registrarLog;