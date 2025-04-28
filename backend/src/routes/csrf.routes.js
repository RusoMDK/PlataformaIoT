const express = require('express');
const router = express.Router();
const { getCsrfToken } = require('../controllers/csrf.controller');
const csrfProtection = require('../middlewares/csrfProtection'); // 🔥 importa esto

// 🔥 Aplica csrfProtection en esta ruta
router.get('/csrf-token', csrfProtection, getCsrfToken);

module.exports = router;