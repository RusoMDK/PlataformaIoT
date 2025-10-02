// src/routes/auth2fa.routes.js
const express = require('express');
const router = express.Router(); 

const requireAuth = require('../middlewares/requireAuth'); // ✅ unificado

const { 
  generar2FA, 
  verificar2FA, 
  desactivar2FA, 
  verificarOTP,
  reset2FA,
} = require('../controllers/auth2fa.controller');

// Todas protegidas con autenticación
router.post('/generate-2fa', requireAuth, generar2FA);
router.post('/verify-2fa',   requireAuth, verificar2FA);
router.post('/disable-2fa',  requireAuth, desactivar2FA);
router.post('/check-otp',    requireAuth, verificarOTP);
router.post('/reset-2fa',    requireAuth, reset2FA);

module.exports = router;
