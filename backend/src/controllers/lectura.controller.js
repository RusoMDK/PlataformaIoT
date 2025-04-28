const Lectura = require('../models/Lectura');
const Alerta = require('../models/Alerta');
const AlertaHistorial = require('../models/AlertaHistorial');
const Notificacion = require('../models/Notificacion');

exports.crearLectura = async (req, res) => {
  try {
    const { sensor, valor, unidad } = req.body;

    const lectura = new Lectura({
      sensor,
      valor,
      unidad,
      usuario: req.usuarioId
    });

    await lectura.save();

    // 🔥 Evaluar alertas activas para ese sensor y usuario
    const alertas = await Alerta.find({
      sensor: lectura.sensor,
      activa: true,
      usuario: lectura.usuario
    });

    for (let alerta of alertas) {
      let activar = false;
    
      switch (alerta.operador) {
        case '>': activar = lectura.valor > alerta.valor; break;
        case '<': activar = lectura.valor < alerta.valor; break;
        case '>=': activar = lectura.valor >= alerta.valor; break;
        case '<=': activar = lectura.valor <= alerta.valor; break;
        case '==': activar = lectura.valor == alerta.valor; break;
        case '!=': activar = lectura.valor != alerta.valor; break;
      }
    
      if (activar) {
        console.log(`⚠️ ALERTA ACTIVADA: ${alerta.nombre} - ${alerta.mensaje}`);
    
        // 🧠 Guardar en historial
        const historial = new AlertaHistorial({
          alerta: alerta._id,
          sensor: lectura.sensor,
          usuario: lectura.usuario,
          valor: lectura.valor,
          unidad: lectura.unidad,
          mensaje: alerta.mensaje
        });
    
        await historial.save();
        // 🔔 Crear notificación
        await Notificacion.create({
          usuario: lectura.usuario,
          tipo: 'alerta',
          mensaje: `⚠️ ${alerta.nombre}: ${alerta.mensaje}`
        });
      }
    }

    res.status(201).json(lectura);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al guardar lectura' });
  }
};

exports.obtenerLecturasPorSensor = async (req, res) => {
  try {
    const sensorId = req.query.sensor;
    if (!sensorId) {
      return res.status(400).json({ msg: 'Falta el ID del sensor' });
    }

    const lecturas = await Lectura.find({
      sensor: sensorId,
      usuario: req.usuarioId
    }).sort({ timestamp: -1 });

    res.status(200).json(lecturas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener lecturas' });
  }
};

exports.obtenerLecturasOptimizado = async (req, res) => {
  try {
    const { sensor, pagina = 1, limite = 20, desde, hasta } = req.query;

    const filtro = { sensor, usuario: req.usuarioId };

    if (desde || hasta) {
      filtro.timestamp = {};
      if (desde) filtro.timestamp.$gte = new Date(desde);
      if (hasta) filtro.timestamp.$lte = new Date(hasta);
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const [lecturas, total] = await Promise.all([
      Lectura.find(filtro).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limite)),
      Lectura.countDocuments(filtro)
    ]);

    res.status(200).json({
      lecturas,
      total,
      pagina: parseInt(pagina),
      paginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (err) {
    console.error("❌ Error al obtener lecturas:", err);
    res.status(500).json({ msg: "Error al obtener lecturas" });
  }
};