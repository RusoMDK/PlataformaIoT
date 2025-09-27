const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const registrarLog = require('../helpers/registrarLog');
const speakeasy = require('speakeasy');

/* ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/* ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ */

// POST /api/auth/register
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

    await registrarLog(nuevoUsuario._id, 'Registro', `Nuevo usuario registrado: ${email}`);

    res.status(201).json({
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        is2FAEnabled: false,
      }
    });
  } catch (err) {
    console.error('❌ Error en registro:', err);
    res.status(500).json({ msg: 'Error interno al registrar usuario' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Intento de login: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email y contraseña requeridos' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+password');

    if (!usuario) {
      console.warn('⚠️ Usuario no encontrado:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      console.warn('🚫 Usuario desactivado:', email);
      return res.status(403).json({ msg: 'Tu cuenta está desactivada' });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      console.warn('❌ Contraseña incorrecta:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // 2FA requerido
    if (usuario.is2FAEnabled) {
      const tempToken = jwt.sign(
        { id: usuario._id },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      console.log('🔒 Usuario con 2FA, esperando código OTP');

      return res.status(200).json({
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          is2FAEnabled: true,
        },
        token: tempToken,
      });
    }

    // ✅ Usuario sin 2FA → generar token completo
    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await registrarLog(usuario._id, 'Login', 'Inicio de sesión exitoso');

    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      })
      .status(200)
      .json({
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          is2FAEnabled: false,
        }
      });
  } catch (err) {
    console.error('🔥 Error en login:', err);
    res.status(500).json({ msg: 'Error interno al iniciar sesión' });
  }
};

// POST /api/auth/logout
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

// GET /api/auth/perfil
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-password');

    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json({ usuario });
  } catch (err) {
    console.error('❌ Error al obtener perfil:', err);
    res.status(500).json({ msg: 'Error interno al obtener perfil' });
  }
};

// POST /api/auth/verify-otp-login
exports.verificarOTPLogin = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ msg: 'Código OTP requerido' });
    }

    const usuario = req.usuario; // ✅ Obtenido correctamente desde tempAuth.middleware

    if (!usuario) {
      return res.status(401).json({ msg: 'Usuario no autenticado' });
    }

    if (!usuario.twoFactorSecret) {
      return res.status(400).json({ msg: '2FA no está configurado en esta cuenta' });
    }

    const verified = require('speakeasy').totp.verify({
      secret: usuario.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ msg: 'Código OTP incorrecto' });
    }

    const tokenReal = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Seteamos cookie del token real
    res.cookie('token', tokenReal, {
      httpOnly: true,
      secure: true, // 👈 SOLO SI USAS HTTPS (y debes usarlo)
      sameSite: 'Lax', // o 'None' si frontend y backend están en dominios distintos
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(`🔓 2FA verificado para ${usuario.email}. Nuevo token generado.`);

    return res.status(200).json({ success: true, token: tokenReal, usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    }});
  } catch (error) {
    console.error('❌ Error verificando OTP:', error);
    return res.status(500).json({ msg: 'Error interno al verificar OTP' });
  }
};


function emitirTokenAgente(userId) {
  return jwt.sign(
    { id: userId, aud: 'agente' },
    process.env.SECRET,
    { expiresIn: '7d' }
  );
}
