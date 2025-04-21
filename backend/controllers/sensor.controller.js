const Sensor = require('../models/Sensor');

exports.crearSensor = async (req, res) => {
  try {
    const { nombre, tipo, pin, unidad, proyecto, protocol, config } = req.body;

    if (!proyecto) {
      return res.status(400).json({ msg: 'El ID del proyecto es obligatorio.' });
    }

    const sensor = new Sensor({
      nombre,
      tipo,
      pin,
      unidad,
      proyecto,
      protocol,
      config,
      usuario: req.usuarioId
    });

    await sensor.save();
    res.status(201).json(sensor);
  } catch (err) {
    console.error("❌ Error al crear sensor:", err);
    res.status(500).json({ msg: 'Error al crear sensor' });
  }
};

exports.obtenerSensores = async (req, res) => {
  try {
    const { proyecto } = req.query;
    if (!proyecto) return res.status(400).json({ msg: "Falta el ID del proyecto en la query." });

    const sensores = await Sensor.find({ proyecto });
    res.status(200).json(sensores);
  } catch (err) {
    console.error("❌ Error al obtener sensores:", err);
    res.status(500).json({ msg: "Error al obtener sensores" });
  }
};

exports.eliminarSensoresPorProyecto = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const usuarioId = req.usuarioId;

    await Sensor.deleteMany({ proyecto: proyectoId, usuario: usuarioId });

    res.json({ msg: 'Sensores eliminados correctamente' });
  } catch (err) {
    console.error("❌ Error al eliminar sensores del proyecto:", err);
    res.status(500).json({ msg: 'Error al eliminar sensores del proyecto' });
  }
};

exports.obtenerSensorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const sensor = await Sensor.findById(id);
    if (!sensor) return res.status(404).json({ msg: 'Sensor no encontrado' });

    res.status(200).json(sensor);
  } catch (err) {
    console.error("❌ Error al obtener sensor por ID:", err);
    res.status(500).json({ msg: 'Error al obtener sensor' });
  }
};