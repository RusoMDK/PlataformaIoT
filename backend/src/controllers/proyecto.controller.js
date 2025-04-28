const Proyecto = require('../models/Proyecto');
const Log = require('../models/Log');
const Sensor = require('../models/Sensor');
const AlertaHistorial = require('../models/AlertaHistorial');
const Lectura = require('../models/Lectura');

exports.crearProyecto = async (req, res) => {
  try {
    const { nombre, descripcion, placa, sensores = [] } = req.body;

    // 1. Crear proyecto
    const nuevoProyecto = new Proyecto({
      nombre,
      descripcion,
      placa: placa || null,
      usuario: req.usuarioId
    });

    await nuevoProyecto.save();

    // 2. Guardar sensores asociados
    const sensoresConProyecto = sensores.map(s => ({
      ...s,
      proyecto: nuevoProyecto._id,
      usuario: req.usuarioId
    }));

    await Sensor.insertMany(sensoresConProyecto);

    // 3. Registrar log
    await Log.create({
      usuario: req.usuarioId,
      accion: 'Creación de proyecto',
      detalle: `Proyecto: ${nuevoProyecto.nombre}`
    });

    res.status(201).json(nuevoProyecto);
  } catch (err) {
    console.error("❌ Error en crearProyecto:", err);
    res.status(500).json({ msg: 'Error al crear proyecto', error: err.message });
  }
};

exports.obtenerProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ usuario: req.usuarioId });
    res.status(200).json(proyectos);
  } catch (err) {
    console.error("❌ Error en obtenerProyectos:", err);
    res.status(500).json({ msg: 'Error al obtener proyectos', error: err.message });
  }
};

exports.obtenerProyectoPorId = async (req, res) => {
  try {
    const proyecto = await Proyecto.findOne({ _id: req.params.id, usuario: req.usuarioId });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (err) {
    console.error("❌ Error en obtenerProyectoPorId:", err);
    res.status(500).json({ msg: 'Error al obtener proyecto' });
  }
};

exports.obtenerResumenProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const sensores = await Sensor.find({ proyecto: id, usuario: req.usuarioId });
    const sensorIds = sensores.map(s => s._id);

    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);

    const alertasUltimos7 = await AlertaHistorial.find({
      sensor: { $in: sensorIds },
      usuario: req.usuarioId,
      timestamp: { $gte: hace7dias }
    });

    const alertasResueltas = alertasUltimos7.filter(a => a.resuelta).length;
    const alertasPendientes = alertasUltimos7.filter(a => !a.resuelta).length;

    const lecturasPorSensor = {};
    for (let sensor of sensores) {
      const ultima = await Lectura.findOne({ sensor: sensor._id, usuario: req.usuarioId }).sort({ timestamp: -1 });
      if (ultima) {
        lecturasPorSensor[sensor._id] = {
          valor: ultima.valor,
          unidad: ultima.unidad,
          timestamp: ultima.timestamp
        };
      }
    }

    res.status(200).json({
      totalSensores: sensores.length,
      totalAlertas7Dias: alertasUltimos7.length,
      alertasResueltas,
      alertasPendientes,
      lecturasPorSensor
    });
  } catch (err) {
    console.error("Error al obtener resumen del proyecto:", err);
    res.status(500).json({ msg: 'Error al obtener resumen del proyecto' });
  }
};

exports.actualizarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findOneAndUpdate(
      { _id: id, usuario: req.usuarioId },
      req.body,
      { new: true }
    );
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    await Log.create({
      usuario: req.usuarioId,
      accion: 'Actualización de proyecto',
      detalle: `Proyecto actualizado: ${proyecto.nombre}`
    });

    res.json(proyecto);
  } catch (err) {
    console.error("❌ Error al actualizar proyecto:", err);
    res.status(500).json({ msg: "Error al actualizar proyecto" });
  }
};

exports.eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findOneAndDelete({ _id: id, usuario: req.usuarioId });
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    await Log.create({
      usuario: req.usuarioId,
      accion: 'Eliminación de proyecto',
      detalle: `Proyecto eliminado: ${proyecto.nombre}`
    });

    res.json({ msg: 'Proyecto eliminado correctamente' });
  } catch (err) {
    console.error("❌ Error al eliminar proyecto:", err);
    res.status(500).json({ msg: 'Error al eliminar proyecto' });
  }
};
