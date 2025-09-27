// routes/ia.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { generarCodigo } = require('../controllers/ia.controller');

router.get('/codigo/:uid', auth, generarCodigo);

module.exports = router;
