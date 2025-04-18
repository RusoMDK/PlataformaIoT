const express = require('express');
const router = express.Router();
const {
  crearDispositivo,
  obtenerDispositivos,
  verificarConexion,
  marcarComoConfigurado, // ✅ usa el mismo nombre que el controlador
} = require('../controllers/dispositivo.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, crearDispositivo);
router.get('/', auth, obtenerDispositivos);
router.get('/verificar/:uid', verificarConexion);
router.patch('/:uid/configurado', auth, marcarComoConfigurado); // ✅ esta es la que fallaba

module.exports = router;