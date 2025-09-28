// backend/src/controllers/auth.controller.js
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const registrarLog = require('../helpers/registrarLog');
const speakeasy = require('speakeasy');

/* ================== helpers ================== */

// Normaliza nombres desde múltiples alias (opcionales)
function parseNombreApellido(body = {}) {
  const {
    // español
    primerNombre, primerApellido, nombre, apellido, nombreCompleto,
    // inglés / otros
    firstName, lastName, given_name, family_name,
  } = body;

  const n =
    (primerNombre || firstName || given_name || nombre ||
      (nombreCompleto ? nombreCompleto.trim().split(/\s+/)[0] : '') || '')
      .toString()
      .trim();

  const a =
    (primerApellido || lastName || family_name || apellido ||
      (nombreCompleto
        ? nombreCompleto.trim().split(/\s+/).slice(-1)[0]
        : '') || '')
      .toString()
      .trim();

  return { n, a };
}

function normalizeUsername(u = '') {
  return String(u).trim().toLowerCase();
}

const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/i;

function generarToken(usuario, opts = {}) {
  return jwt.sign(
    { id: usuario._id },
    process.env.JWT_SECRET,
    { expiresIn: opts.expiresIn || '7d' }
  );
}

// Para el agente (mejor usa AGENT_JWT_SECRET; si no existe, cae a JWT_SECRET)
function emitirTokenAgente(userId) {
  const secret = process.env.AGENT_JWT_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ id: userId, aud: 'agente' }, secret, { expiresIn: '7d' });
}

function cookieSecureFlag() {
  // Usa true solo en producción con HTTPS
  return process.env.NODE_ENV === 'production';
}

/* ================== endpoints ================== */

// POST /api/auth/register
// Requiere: username, email, password
// Nombres reales (primerNombre / primerApellido / nombreCompleto) son opcionales
exports.registrar = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    const uname = normalizeUsername(username || '');
    const emailNorm = (email || '').toLowerCase().trim();

    if (!uname || !emailNorm || !password) {
      return res.status(400).json({ msg: 'username, email y password son obligatorios.' });
    }

    if (!USERNAME_REGEX.test(uname)) {
      return res.status(400).json({
        msg: 'username inválido (3-30 chars; letras, números, ".", "_" o "-").',
      });
    }

    // Chequear duplicados por username o email
    const dup = await Usuario.findOne({
      $or: [{ username: uname }, { email: emailNorm }],
    }).select('_id username email');

    if (dup) {
      const field = dup.username === uname ? 'username' : 'email';
      return res.status(409).json({ msg: `El ${field} ya está registrado.` });
    }

    // Nombres opcionales
    const { n: nombre1, a: apellido1 } = parseNombreApellido(req.body);
    const doc = {
      username: uname,
      email: emailNorm,
      password,
    };

    // Setear nombres solo si vienen (no son obligatorios)
    if (nombre1) doc.primerNombre = nombre1;
    if (apellido1) doc.primerApellido = apellido1;
    if (req.body?.nombre) doc.nombre = String(req.body.nombre).trim();

    const nuevoUsuario = await Usuario.create(doc);

    await registrarLog(nuevoUsuario._id, 'Registro', `Nuevo usuario: ${emailNorm}`);

    return res.status(201).json({
      usuario: {
        id: nuevoUsuario._id,
        username: nuevoUsuario.username,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        nombre: nuevoUsuario.nombre || '',
        primerNombre: nuevoUsuario.primerNombre || '',
        primerApellido: nuevoUsuario.primerApellido || '',
        is2FAEnabled: !!nuevoUsuario.is2FAEnabled,
      },
    });
  } catch (err) {
    console.error('❌ Error en registro:', err);
    return res.status(500).json({ msg: 'Error interno al registrar usuario' });
  }
};

// POST /api/auth/login
// Login sigue con email + password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const emailNorm = (email || '').toLowerCase().trim();
    console.log(`🔐 Intento de login: ${emailNorm}`);

    if (!emailNorm || !password) {
      return res.status(400).json({ msg: 'Email y contraseña requeridos' });
    }

    const usuario = await Usuario.findOne({ email: emailNorm }).select('+password');
    if (!usuario) {
      console.warn('⚠️ Usuario no encontrado:', emailNorm);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    if (usuario.activo === false) {
      console.warn('🚫 Usuario desactivado:', emailNorm);
      return res.status(403).json({ msg: 'Tu cuenta está desactivada' });
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      console.warn('❌ Contraseña incorrecta:', emailNorm);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Si 2FA está habilitado -> token temporal
    if (usuario.is2FAEnabled) {
      const tempToken = generarToken(usuario, { expiresIn: '5m' });
      console.log('🔒 Usuario con 2FA, esperando código OTP');

      return res.status(200).json({
        usuario: {
          id: usuario._id,
          username: usuario.username,
          email: usuario.email,
          rol: usuario.rol,
          nombre: usuario.nombre,
          primerNombre: usuario.primerNombre,
          primerApellido: usuario.primerApellido,
          is2FAEnabled: true,
        },
        token: tempToken,
      });
    }

    // Usuario sin 2FA -> token completo + cookie
    const token = generarToken(usuario);

    await registrarLog(usuario._id, 'Login', 'Inicio de sesión exitoso');

    return res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'Lax',
        secure: cookieSecureFlag(),
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      })
      .status(200)
      .json({
        usuario: {
          id: usuario._id,
          username: usuario.username,
          email: usuario.email,
          rol: usuario.rol,
          nombre: usuario.nombre,
          primerNombre: usuario.primerNombre,
          primerApellido: usuario.primerApellido,
          is2FAEnabled: false,
        },
      });
  } catch (err) {
    console.error('🔥 Error en login:', err);
    return res.status(500).json({ msg: 'Error interno al iniciar sesión' });
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: cookieSecureFlag(),
      sameSite: 'Strict',
    });
    return res.json({ msg: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err);
    return res.status(500).json({ msg: 'Error interno al cerrar sesión' });
  }
};

// GET /api/auth/perfil
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-password');
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    return res.json({ usuario });
  } catch (err) {
    console.error('❌ Error al obtener perfil:', err);
    return res.status(500).json({ msg: 'Error interno al obtener perfil' });
  }
};

// POST /api/auth/verify-otp-login
exports.verificarOTPLogin = async (req, res) => {
  try {
    const { otp } = req.body || {};
    if (!otp) return res.status(400).json({ msg: 'Código OTP requerido' });

    const usuario = req.usuario; // inyectado por tempAuth.middleware
    if (!usuario) return res.status(401).json({ msg: 'Usuario no autenticado' });
    if (!usuario.twoFactorSecret) {
      return res.status(400).json({ msg: '2FA no está configurado en esta cuenta' });
    }

    const verified = speakeasy.totp.verify({
      secret: usuario.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });
    if (!verified) return res.status(401).json({ msg: 'Código OTP incorrecto' });

    const tokenReal = generarToken(usuario);

    res.cookie('token', tokenReal, {
      httpOnly: true,
      secure: cookieSecureFlag(),
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(`🔓 2FA verificado para ${usuario.email}. Nuevo token generado.`);

    return res.status(200).json({
      success: true,
      token: tokenReal,
      usuario: {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
        primerNombre: usuario.primerNombre,
        primerApellido: usuario.primerApellido,
      },
    });
  } catch (error) {
    console.error('❌ Error verificando OTP:', error);
    return res.status(500).json({ msg: 'Error interno al verificar OTP' });
  }
};

/* export opcional si usas el token para el agente en otros módulos */
exports.emitirTokenAgente = emitirTokenAgente;
