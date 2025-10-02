const router = require('express').Router();
const { createClaim, registerDevice, heartbeat } = require('../controllers/provision.controller');
const auth = require('../middlewares/auth.middleware'); // tu middleware de usuario

// Usuario autenticado crea claim para un device en su proyecto
router.post('/devices/claims', auth, createClaim);

// Dispositivo (sin auth usuario) se registra con claimToken
router.post('/devices/register', registerDevice);

// Heartbeat de dispositivo ya registrado (puede venir con Basic MQTT o token device si luego lo añadimos)
router.post('/devices/heartbeat', heartbeat);

module.exports = router;
