// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const csrfProtection = require('../middlewares/csrfProtection');
const authMiddleware   = require('../middlewares/auth.middleware');

router.post('/register', authController.registrar);
router.post('/login',    csrfProtection, authController.login);
router.get ('/perfil',   authMiddleware, authController.obtenerPerfil);

// 🛑 **Aquí** añadimos el logout
router.post('/logout', csrfProtection, authController.logout);

module.exports = router;