// controllers/visualizacion.controller.js
const Visualizacion = require('../models/Visualizacion');

exports.crearVisualizacion = async (req, res) => {
  try {
    const { proyecto, titulo, tipo, sensores, orden } = req.body;

    const nueva = new Visualizacion({
      usuario: req.usuarioId,
      proyecto,
      titulo,
      tipo, // <-- esto debe guardarse tal cual venga del frontend
      sensores,
      orden
    });

    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    console.error("Error al crear visualización:", err);
    res.status(500).json({ msg: "Error al crear visualización" });
  }
};

// ✅ Obtener visualizaciones de un proyecto
exports.obtenerVisualizaciones = async (req, res) => {
  try {
    const { proyecto } = req.query;
    const visualizaciones = await Visualizacion.find({ usuario: req.usuarioId, proyecto }).sort({ orden: 1 });
    res.status(200).json(visualizaciones);
  } catch (err) {
    console.error("Error al obtener visualizaciones:", err);
    res.status(500).json({ msg: "Error al obtener visualizaciones" });
  }
};

// ✅ Actualizar visualización
exports.actualizarVisualizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const visualizacion = await Visualizacion.findOneAndUpdate(
      { _id: id, usuario: req.usuarioId },
      req.body,
      { new: true }
    );

    if (!visualizacion) return res.status(404).json({ msg: 'Visualización no encontrada' });

    res.status(200).json(visualizacion);
  } catch (err) {
    console.error("Error al actualizar visualización:", err);
    res.status(500).json({ msg: "Error al actualizar visualización" });
  }
};

// ✅ Eliminar visualización
exports.eliminarVisualizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Visualizacion.findOneAndDelete({ _id: id, usuario: req.usuarioId });
    if (!eliminado) return res.status(404).json({ msg: 'Visualización no encontrada' });

    res.status(200).json({ msg: 'Visualización eliminada' });
  } catch (err) {
    console.error("Error al eliminar visualización:", err);
    res.status(500).json({ msg: "Error al eliminar visualización" });
  }
};
