// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const csrfProtection = require('../middlewares/csrfProtection');
const authMiddleware = require('../middlewares/auth.middleware');
const tempAuthMiddleware = require('../middlewares/tempAuth.middleware')

// Registro de usuario
router.post('/register', authController.registrar);

// Login con CSRF
router.post('/login', csrfProtection, authController.login);

// Logout con CSRF
router.post('/logout', csrfProtection, authController.logout);

// Perfil del usuario autenticado
router.get('/perfil', authMiddleware, authController.obtenerPerfil);

// Verificar OTP después del login
router.post('/verify-otp-login', authMiddleware, authController.verificarOTPLogin); 

router.post('/verify-otp-login', tempAuthMiddleware, authController.verificarOTPLogin); // 🔥 AQUÍ USAMOS tempAuth


module.exports = router;