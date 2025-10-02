// routes/ia.routes.js
const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth'); // ✅ unificado
const { generarCodigo } = require('../controllers/ia.controller');

router.get('/codigo/:uid', requireAuth, generarCodigo);

module.exports = router;
