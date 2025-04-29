const express = require('express');
const router = express.Router(); 
const authMiddleware = require('../middlewares/auth.middleware');

const { 
  generar2FA, 
  verificar2FA, 
  desactivar2FA, 
  verificarOTP,
  reset2FA,
} = require('../controllers/auth2fa.controller');

// Todas protegidas con autenticación
router.post('/generate-2fa', authMiddleware, generar2FA);
router.post('/verify-2fa', authMiddleware, verificar2FA);
router.post('/disable-2fa', authMiddleware, desactivar2FA);
router.post('/check-otp', authMiddleware, verificarOTP);
router.post('/reset-2fa', authMiddleware, reset2FA);

module.exports = router;