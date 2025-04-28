const Alerta = require('../models/Alerta');

exports.crearAlerta = async (req, res) => {
  try {
    const nuevaAlerta = new Alerta({ ...req.body, usuario: req.usuarioId });
    await nuevaAlerta.save();
    res.status(201).json(nuevaAlerta);
  } catch (err) {
    console.error(err);
    console.error('Error creando alerta:', err);
    res.status(500).json({ msg: 'Error al crear alerta', error: err.message });
  }
};

exports.obtenerAlertas = async (req, res) => {
  try {
    const alertas = await Alerta.find({ usuario: req.usuarioId }).populate('sensor');
    res.status(200).json(alertas);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener alertas' });
  }
};

exports.eliminarAlerta = async (req, res) => {
  try {
    await Alerta.findOneAndDelete({ _id: req.params.id, usuario: req.usuarioId });
    res.status(200).json({ msg: 'Alerta eliminada' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar alerta' });
  }
};