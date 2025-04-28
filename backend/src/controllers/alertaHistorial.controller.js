const AlertaHistorial = require('../models/AlertaHistorial');
const Sensor = require('../models/Sensor');
const Alerta = require('../models/Alerta');


exports.obtenerHistorial = async (req, res) => {
  try {
    const historial = await AlertaHistorial.find({ usuario: req.usuarioId })
      .populate('alerta')
      .populate('sensor')
      .sort({ timestamp: -1 });

    res.status(200).json(historial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener historial de alertas' });
  }
};

exports.obtenerHistorialFiltrado = async (req, res) => {
  try {
    const { sensor, proyecto } = req.query;

    const filtro = { usuario: req.usuarioId };

    if (sensor) filtro.sensor = sensor;

    if (proyecto) {
      // Traer sensores de ese proyecto
      const sensores = await require('../models/Sensor').find({ proyecto }).select('_id');
      filtro.sensor = { $in: sensores.map(s => s._id) };
    }

    const historial = await require('../models/AlertaHistorial')
      .find(filtro)
      .populate('alerta')
      .populate('sensor')
      .sort({ timestamp: -1 });

    res.status(200).json(historial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al filtrar historial de alertas' });
  }
};

exports.marcarComoVista = async (req, res) => {
  try {
    const { id } = req.params;

    const alerta = await require('../models/AlertaHistorial').findOne({
      _id: id,
      usuario: req.usuarioId
    });

    if (!alerta) {
      return res.status(404).json({ msg: 'Alerta no encontrada' });
    }

    alerta.vista = true;
    await alerta.save();

    res.status(200).json({ msg: 'Alerta marcada como vista' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al marcar alerta' });
  }
};

exports.marcarComoResuelta = async (req, res) => {
  try {
    const { id } = req.params;

    const alerta = await require('../models/AlertaHistorial').findOne({
      _id: id,
      usuario: req.usuarioId
    });

    if (!alerta) {
      return res.status(404).json({ msg: 'Alerta no encontrada' });
    }

    alerta.resuelta = true;
    await alerta.save();

    res.status(200).json({ msg: 'Alerta marcada como resuelta' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al marcar alerta' });
  }
};

exports.filtrarHistorial = async (req, res) => {
  try {
    const filtro = { usuario: req.usuarioId };

    // 🎯 Filtro por sensor
    if (req.query.sensor) {
      filtro.sensor = req.query.sensor;
    }

    const historial = await AlertaHistorial.find(filtro)
      .populate('alerta')
      .populate('sensor')
      .sort({ timestamp: -1 });

    res.status(200).json(historial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al filtrar historial' });
  }
};

exports.obtenerHistorialPorProyecto = async (req, res) => {
  try {
    const { proyecto } = req.query;
    if (!proyecto) {
      return res.status(400).json({ msg: 'Falta el ID del proyecto' });
    }

    // 1. Buscar sensores del proyecto y usuario
    const sensores = await Sensor.find({ proyecto, usuario: req.usuarioId });
    const sensoresIds = sensores.map(s => s._id);

    // 2. Buscar historial de alertas relacionadas a esos sensores (puede estar vacío)
    const historial = await AlertaHistorial.find({ sensor: { $in: sensoresIds } })
      .populate('alerta')
      .populate('sensor')
      .sort({ timestamp: -1 });

    res.status(200).json(historial); // ✅ SIEMPRE devolver 200 con array, incluso vacío
  } catch (err) {
    console.error("❌ Error al obtener historial por proyecto:", err);
    res.status(500).json({ msg: 'Error al obtener historial por proyecto' });
  }
};