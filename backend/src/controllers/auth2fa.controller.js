const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const Usuario = require('../models/Usuario');

// 1️⃣ Generar QR y guardar secreto temporal
exports.generar2FA = async (req, res) => {
    try {
      const secret = speakeasy.generateSecret({
        name: `IoTPlatform (${req.usuario.email})`,
      });
  
      const qr = await qrcode.toDataURL(secret.otpauth_url);
  
      await Usuario.findByIdAndUpdate(req.usuario.id, {
        twoFactorTempSecret: secret.base32,
      });
  
      res.json({ qr, secret: secret.base32 }); // <-- AÑADIMOS secret aquí 🔥
    } catch (error) {
      console.error('❌ Error generando 2FA:', error);
      res.status(500).json({ error: 'Error generando 2FA' });
    }
  };

// 2️⃣ Verificar OTP y activar 2FA
exports.verificar2FA = async (req, res) => {
  const { otp } = req.body;
  console.log('🛡️ BODY recibido en verificar2FA:', req.body); // <-- 🔥 Ponerlo aquí
  if (!otp) return res.status(400).json({ error: 'Código requerido' });

  const usuario = await Usuario.findById(req.usuario.id);
  console.log('🧠 Usuario obtenido para verificar 2FA:', usuario);

  if (!usuario?.twoFactorTempSecret) {
    return res.status(400).json({ error: 'No se ha iniciado la activación de 2FA' });
  }

  const isValid = speakeasy.totp.verify({
    secret: usuario.twoFactorTempSecret,
    encoding: 'base32',
    token: otp,
    window: 1,
  });

  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Código inválido' });
  }

  usuario.twoFactorSecret = usuario.twoFactorTempSecret;
  usuario.twoFactorTempSecret = undefined;
  usuario.is2FAEnabled = true; // 🔥 Marcamos explícitamente que 2FA está activo
  await usuario.save();

  res.json({ success: true });
};

// 3️⃣ Desactivar 2FA
exports.desactivar2FA = async (req, res) => {
  try {
    await Usuario.findByIdAndUpdate(req.usuario.id, {
      twoFactorSecret: undefined,
      twoFactorTempSecret: undefined,
      is2FAEnabled: false, // 🔥 Marcamos explícitamente que 2FA está inactivo
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error desactivando 2FA:', error);
    res.status(500).json({ error: 'Error desactivando 2FA' });
  }
};

exports.reset2FA = async (req, res) => {
    try {
      // Código de reset (o simplemente un res.send temporal para probar)
      res.json({ msg: 'Reset 2FA hecho' });
    } catch (error) {
      console.error('Error reseteando 2FA:', error);
      res.status(500).json({ msg: 'Error reseteando 2FA' });
    }
  };

  exports.verificarOTP = async (req, res) => {
    try {
      const { otp } = req.body;
      const usuario = await Usuario.findById(req.usuario.id);
  
      if (!usuario || !usuario.twoFactorSecret) {
        return res.status(400).json({ error: 'No hay 2FA activo' });
      }
  
      const isValid = speakeasy.totp.verify({
        secret: usuario.twoFactorSecret,
        encoding: 'base32',
        token: otp,
        window: 1,
      });
  
      if (!isValid) {
        return res.status(401).json({ error: 'OTP inválido' });
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error en verificarOTP:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  };