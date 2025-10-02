// src/routes/dispositivo.routes.js
const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth');   // ✅ unificado
const { requireDevice } = require('../middlewares/requireDevice');
const controlador = require('../controllers/dispositivo.controller');

const {
  crearDispositivo,
  obtenerDispositivos,
  verificarConexion,
  marcarComoConfigurado,
  guardarSensoresDispositivo,
  obtenerDispositivoPorUid,
  obtenerTodosLosDispositivos,
} = controlador;

// 🔐 Crear o actualizar un dispositivo (upsert)
router.post('/', requireAuth, crearDispositivo);

// 🔐 Obtener todos los dispositivos del usuario autenticado
router.get('/', requireAuth, obtenerDispositivos);

// 🔐 Ruta “raw” (si debe ser admin, añade rol aquí; por ahora autenticado basta)
router.get('/raw', requireAuth, obtenerTodosLosDispositivos);

// 🔐 Verificar conexión de un dispositivo específico (ownership)
router.get('/verificar/:uid', requireAuth, requireDevice, verificarConexion);

// 🔐 Marcar un dispositivo como configurado (ownership)
router.patch('/:uid/configurado', requireAuth, requireDevice, marcarComoConfigurado);

// 🔐 Guardar sensores asociados a un dispositivo (ownership)
router.patch('/:uid/sensores', requireAuth, requireDevice, guardarSensoresDispositivo);

// 🔐 Obtener un dispositivo por su UID (ownership) — esta debe ir al final
router.get('/:uid', requireAuth, requireDevice, obtenerDispositivoPorUid);

module.exports = router;
