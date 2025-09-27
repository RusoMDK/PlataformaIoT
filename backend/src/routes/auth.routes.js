// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const csrfProtection = require('../middlewares/csrfProtection');
const authMiddleware = require('../middlewares/auth.middleware');
const tempAuthMiddleware = require('../middlewares/tempAuth.middleware'); // 🔥 nuevo

// Registro de usuario
router.post('/register', authController.registrar);

// Logout con CSRF (porque ya estás autenticado)
router.post('/logout', csrfProtection, authController.logout);

// Perfil del usuario autenticado
router.get('/perfil', authMiddleware, authController.obtenerPerfil);

// Token desde cookie
router.get('/jwt-token', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  res.json({ token });
});

// Autenticación del agente
router.post('/auth/login/agente', (req, res) => {
  const { token } = req.body;
  try {
    const payload = jwt.verify(token, process.env.SECRET);

    if (payload.aud !== 'agente') {
      return res.status(403).json({ msg: 'Token no válido para agentes' });
    }

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'Strict',
      secure: true,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ Token inválido para agente:', err.message);
    res.status(401).json({ msg: 'Token inválido' });
  }
});

module.exports = router;
