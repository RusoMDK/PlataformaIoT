const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const controlador = require("../controllers/dispositivo.controller");

const {
  crearDispositivo,
  obtenerDispositivos,
  verificarConexion,
  marcarComoConfigurado,
  guardarSensoresDispositivo,
  obtenerDispositivoPorUid,
} = require('../controllers/dispositivo.controller');

// 🔐 Crear o actualizar un dispositivo (upsert)
router.post('/', auth, crearDispositivo);

// 🔐 Obtener todos los dispositivos configurados del usuario
router.get('/', auth, obtenerDispositivos);

// 🔐 Verificar conexión de un dispositivo específico
router.get('/verificar/:uid', auth, verificarConexion);

// 🔐 Marcar un dispositivo como configurado
router.patch('/:uid/configurado', auth, marcarComoConfigurado);

// 🔐 Guardar sensores asociados a un dispositivo
router.patch('/:uid/sensores', auth, guardarSensoresDispositivo);

// 🔐 Obtener un dispositivo por su UID
router.get('/:uid', auth, obtenerDispositivoPorUid);

router.get("/raw", auth, controlador.obtenerTodosLosDispositivos);

module.exports = router;