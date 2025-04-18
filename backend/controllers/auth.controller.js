const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const registrarLog = require('../helpers/registrarLog');

const generarToken = (usuario) => {
  return jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ msg: 'Email ya registrado' });

    const usuario = new Usuario({ nombre, email, password });
    await usuario.save();

    await registrarLog(usuario._id, 'Registro', `Usuario registrado: ${usuario.email}`);

    const token = generarToken(usuario);
    res.status(201).json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error('❌ Error al registrar usuario:', err);
    res.status(500).json({ msg: 'Error al registrar usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📥 Intento de login con:", email);

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      console.log("❌ Usuario no encontrado");
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    if (usuario.activo === false) {
      console.log("🚫 Cuenta desactivada:", email);
      return res.status(403).json({ msg: 'Tu cuenta está desactivada. Contacta al administrador.' });
    }

    const valido = await usuario.compararPassword(password);
    if (!valido) {
      console.log("❌ Contraseña incorrecta para:", email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);
    console.log("✅ Login exitoso para:", email);

    await registrarLog(usuario._id, 'Login', 'Inicio de sesión exitoso');

    res.status(200).json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error('🔥 Error al iniciar sesión:', err);
    res.status(500).json({ msg: 'Error al iniciar sesión' });
  }
};

exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-password');
    res.json({ usuario });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    res.status(500).json({ msg: 'Error al obtener perfil' });
  }
};
