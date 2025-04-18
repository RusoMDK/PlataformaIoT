const Log = require('../models/Log');
const Usuario = require('../models/Usuario');

// Obtener logs del usuario autenticado
exports.obtenerLogsUsuario = async (req, res) => {
  try {
    const logs = await Log.find({ usuario: req.usuarioId }).sort({ fecha: -1 });
    res.status(200).json(logs);
  } catch (err) {
    console.error("Error al obtener logs del usuario:", err);
    res.status(500).json({ msg: "Error al obtener logs" });
  }
};

// Obtener todos los logs (para admin)
exports.obtenerTodosLosLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ fecha: -1 }).populate('usuario', 'nombre email');
    res.status(200).json(logs);
  } catch (err) {
    console.error("Error al obtener todos los logs:", err);
    res.status(500).json({ msg: "Error al obtener logs" });
  }
};

// Registrar un nuevo log desde cualquier parte del sistema
exports.registrarLog = async ({ usuario, accion, detalle, ip }) => {
  try {
    await Log.create({ usuario, accion, detalle, ip });
  } catch (err) {
    console.error("Error al registrar log:", err);
  }
};

exports.obtenerLogsGlobales = async (req, res) => {
  try {
    const logs = await Log.find().sort({ fecha: -1 }).populate('usuario', 'nombre email');
    res.status(200).json(logs);
  } catch (err) {
    console.error("❌ Error al obtener logs globales:", err);
    res.status(500).json({ msg: "Error al obtener logs del sistema" });
  }
};

exports.eliminarVariosLogs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ msg: "Debes enviar un array de IDs." });
    }

    await Log.deleteMany({ _id: { $in: ids } });
    res.json({ msg: "Logs eliminados correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar logs:", err);
    res.status(500).json({ msg: "Error al eliminar logs" });
  }
};