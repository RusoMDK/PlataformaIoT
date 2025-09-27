const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const tempAuthMiddleware = require('../middlewares/tempAuth.middleware');

// 🔓 Rutas que NO usan csrfProtection
router.post('/login', authController.login);
router.post('/verify-otp-login', tempAuthMiddleware, authController.verificarOTPLogin);

// backend/src/routes/loginSinCsrf.route.js
router.get('/jwt-token', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No autenticado' });
    res.json({ token });
  });
  

module.exports = router;
