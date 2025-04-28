const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const registrarLog = require('../helpers/registrarLog');

/**
 * Genera un JWT válido para 7 días
 */
const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/auth/registro
 * Registra un nuevo usuario
 */
exports.registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    const existe = await Usuario.findOne({ email: email.toLowerCase() });
    if (existe) {
      return res.status(409).json({ msg: 'El email ya está registrado' });
    }

    const nuevoUsuario = new Usuario({ nombre, email, password });
    await nuevoUsuario.save();

    await registrarLog(
      nuevoUsuario._id,
      'Registro',
      `Nuevo usuario registrado: ${email}`
    );

    const token = generarToken(nuevoUsuario);

    // Setear cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // solo HTTPS en producción
      sameSite: 'Strict', // para evitar CSRF básicos
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.status(201).json({
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      }
    });
  } catch (err) {
    console.error('❌ Error en registro:', err);
    res.status(500).json({ msg: 'Error interno al registrar usuario' });
  }
};

/**
 * POST /api/auth/login
 * Autentica un usuario existente
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Login intento: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email y contraseña requeridos' });
    }

    const usuario = await Usuario
      .findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!usuario) {
      console.warn('⚠️ Usuario no encontrado:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    if (usuario.activo === false) {
      console.warn('🚫 Usuario desactivado:', email);
      return res.status(403).json({ msg: 'Tu cuenta está desactivada' });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      console.warn('❌ Contraseña incorrecta para:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);
    await registrarLog(usuario._id, 'Login', 'Inicio de sesión exitoso');
    console.log('✅ Login exitoso para:', email);

    // Setear cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.status(200).json({
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      }
    });
  } catch (err) {
    console.error('🔥 Error en login:', err);
    res.status(500).json({ msg: 'Error interno al iniciar sesión' });
  }
};

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario
 */
exports.logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.json({ msg: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err);
    res.status(500).json({ msg: 'Error interno al cerrar sesión' });
  }
};

/**
 * GET /api/auth/perfil
 * Devuelve el perfil del usuario autenticado
 */
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario
      .findById(req.usuarioId)
      .select('-password');

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json({ usuario });
  } catch (err) {
    console.error('❌ Error al obtener perfil:', err);
    res.status(500).json({ msg: 'Error interno al obtener perfil' });
  }
};