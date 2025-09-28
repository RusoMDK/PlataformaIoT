// backend/src/routes/loginSinCsrf.route.js
'use strict';

const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authController = require('../controllers/auth.controller');
const tempAuthMiddleware = require('../middlewares/tempAuth.middleware');
// Middleware que valida cookie httpOnly "token" o Authorization: Bearer <token>
const authRequired = require('../middlewares/authRequired');

/* ───────────────────── Rutas SIN CSRF ───────────────────── */

// Login normal (setea cookie httpOnly "token")
router.post('/login', authController.login);

// Verificación OTP (requiere token temporal en Authorization)
router.post('/verify-otp-login', tempAuthMiddleware, authController.verificarOTPLogin);

/**
 * GET /api/auth/jwt-token
 * Devuelve un JWT corto (1h) para frontend/agent.
 * Requiere sesión válida (cookie httpOnly o bearer), validada por authRequired.
 */
router.get('/jwt-token', authRequired, async (req, res) => {
  try {
    const user = await Usuario.findById(req.usuarioId).select('_id rol email activo nombre');
    if (!user) {
      return res.status(401).json({ msg: 'Usuario no encontrado' });
    }
    if (user.activo === false) {
      return res.status(403).json({ msg: 'Cuenta desactivada' });
    }

    const token = jwt.sign(
      { sub: String(user._id), aud: 'dashboard' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      ok: true,
      token,
      usuario: { id: user._id, email: user.email, nombre: user.nombre, rol: user.rol },
    });
  } catch (err) {
    console.error('jwt-token error:', err);
    return res.status(500).json({ msg: 'No se pudo emitir token' });
  }
});

/**
 * GET /api/auth/me-light
 * Endpoint liviano para que el frontend verifique sesión por cookie/bearer sin CSRF.
 */
router.get('/me-light', authRequired, (req, res) => {
  const { _id, email, nombre, rol, activo } = req.usuario || {};
  return res.status(200).json({
    ok: true,
    usuario: { id: _id, email, nombre, rol, activo },
  });
});

/**
 * (Opcional) GET /api/auth/ping
 * Útil para diagnóstico rápido de auth/cookies.
 */
router.get('/ping', (req, res) => {
  return res.status(200).json({ pong: true, time: new Date().toISOString() });
});

module.exports = router;
