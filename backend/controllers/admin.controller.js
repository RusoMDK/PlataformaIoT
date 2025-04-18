const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
const Sensor = require('../models/Sensor');
const Lectura = require('../models/Lectura');
const Log = require('../models/Log');

// Estadísticas generales
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const totalUsuarios = await Usuario.countDocuments();
    const totalProyectos = await Proyecto.countDocuments();
    const totalSensores = await Sensor.countDocuments();
    const totalLecturas = await Lectura.countDocuments();

    const usuarios = await Usuario.find().select('nombre email').lean();

    const detalleUsuarios = await Promise.all(
      usuarios.map(async (usuario) => {
        const proyectos = await Proyecto.find({ usuario: usuario._id }).select('nombre');
        return {
          usuario: {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email
          },
          totalProyectos: proyectos.length,
          proyectos: proyectos.map(p => p.nombre)
        };
      })
    );

    res.status(200).json({
      totalUsuarios,
      totalProyectos,
      totalSensores,
      totalAlertas: totalLecturas,
      usuarios: detalleUsuarios
    });
  } catch (err) {
    console.error("❌ Error al obtener estadísticas:", err);
    res.status(500).json({ msg: 'Error al obtener estadísticas' });
  }
};

// Listar usuarios
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.status(200).json(usuarios);
  } catch (err) {
    console.error("❌ Error al listar usuarios:", err);
    res.status(500).json({ msg: "Error al obtener usuarios" });
  }
};

// Actualizar rol
exports.actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(id, { rol }, { new: true }).select('-password');
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    await Log.create({
      usuario: req.usuarioId,
      accion: 'Cambio de rol',
      detalle: `El usuario ${usuario.email} ahora es ${rol}`
    });

    res.status(200).json(usuario);
  } catch (err) {
    console.error("❌ Error al cambiar rol:", err);
    res.status(500).json({ msg: "Error al cambiar rol" });
  }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    await Usuario.findByIdAndDelete(id);

    await Log.create({
      usuario: req.usuarioId,
      accion: 'Eliminación de usuario',
      detalle: `Usuario eliminado: ${usuario.email}`
    });

    res.status(200).json({ msg: "Usuario eliminado" });
  } catch (err) {
    console.error("❌ Error al eliminar usuario:", err);
    res.status(500).json({ msg: "Error al eliminar usuario" });
  }
};

exports.toggleEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    usuario.activo = !usuario.activo;
    await usuario.save();

    await Log.create({
      usuario: req.usuarioId,
      accion: 'Cambio de estado de cuenta',
      detalle: `Cuenta de ${usuario.email} ${usuario.activo ? 'activada' : 'desactivada'}`
    });

    res.json({ msg: `Usuario ${usuario.activo ? 'activado' : 'desactivado'}`, activo: usuario.activo });
  } catch (err) {
    console.error("❌ Error al cambiar estado del usuario:", err);
    res.status(500).json({ msg: 'Error al cambiar estado del usuario' });
  }
};
