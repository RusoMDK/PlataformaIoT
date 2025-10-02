// routes/admin.routes.js
const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth');   // ✅ unificado
const verificarRol = require('../middlewares/rol.middleware');

const {
  obtenerEstadisticas,
  listarUsuarios,
  actualizarRol,
  eliminarUsuario,
  toggleEstadoUsuario,
} = require('../controllers/admin.controller');

// Solo accesible por admin
router.get('/estadisticas',  requireAuth, verificarRol('admin'), obtenerEstadisticas);
router.get('/usuarios',      requireAuth, verificarRol('admin'), listarUsuarios);
router.put('/usuarios/:id/rol', requireAuth, verificarRol('admin'), actualizarRol);
router.delete('/usuarios/:id',   requireAuth, verificarRol('admin'), eliminarUsuario);
router.patch('/usuarios/:id/estado', requireAuth, verificarRol('admin'), toggleEstadoUsuario);

module.exports = router;
