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
    console.log(`🔐 Login intento: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email y contraseña requeridos' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+password');

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

    // 🛡️ Si el usuario tiene 2FA activo, NO emitir token todavía
    if (usuario.is2FAEnabled) {
      console.log('🔒 Usuario requiere verificación 2FA');
      return res.status(200).json({
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          is2FAEnabled: true
        }
      });
    }

    // ✅ Usuario sin 2FA: generar token normal
    const token = generarToken(usuario);
    await registrarLog(usuario._id, 'Login', 'Inicio de sesión exitoso');
    console.log('✅ Login exitoso para:', email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        is2FAEnabled: false
      },
      token
    });
  } catch (err) {
    console.error('🔥 Error en login:', err);
    res.status(500).json({ msg: 'Error interno al iniciar sesión' });
  }
};

// POST /api/auth/verify-otp-login
exports.verificarOTPLogin = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({ msg: 'Código OTP y correo requeridos' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() });

    if (!usuario || !usuario.twoFactorSecret) {
      return res.status(400).json({ msg: 'Cuenta inválida o 2FA no configurado' });
    }

    const verified = speakeasy.totp.verify({
      secret: usuario.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      console.warn('❌ Código OTP incorrecto para usuario:', email);
      return res.status(401).json({ msg: 'Código OTP incorrecto' });
    }

    // ✅ OTP correcto → emitir token ahora
    const token = generarToken(usuario);
    await registrarLog(usuario._id, '2FA', 'Verificación 2FA exitosa');

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('✅ Verificación 2FA correcta para:', email);

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('❌ Error verificando OTP en login:', error);
    res.status(500).json({ msg: 'Error interno al verificar OTP' });
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

exports.verificarOTPLogin = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ msg: 'Código OTP requerido' });
    }

    const userId = req.usuarioId; // 👈 Esto viene del temp token
    if (!userId) {
      return res.status(401).json({ msg: 'Usuario no autenticado' });
    }

    const usuario = await Usuario.findById(userId);

    if (!usuario?.twoFactorSecret) {
      return res.status(400).json({ msg: '2FA no está configurado en esta cuenta' });
    }

    const verified = speakeasy.totp.verify({
      secret: usuario.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ msg: 'Código OTP incorrecto' });
    }

    // ✅ Si OTP es correcto → Generamos el token real
    const tokenReal = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Seteamos cookie de token real
    res.cookie('token', tokenReal, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    console.log('🔓 2FA verificado y nuevo token generado correctamente');

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Error verificando OTP:', error);
    return res.status(500).json({ msg: 'Error interno al verificar OTP' });
  }
};