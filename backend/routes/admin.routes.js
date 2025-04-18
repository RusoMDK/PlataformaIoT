// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const verificarRol = require('../middleware/rol.middleware');
const {
  obtenerEstadisticas,
  listarUsuarios,
  actualizarRol,
  eliminarUsuario,
  toggleEstadoUsuario
} = require('../controllers/admin.controller');

// Solo accesible por admin
router.get('/estadisticas', auth, verificarRol('admin'), obtenerEstadisticas);
router.get('/usuarios', auth, verificarRol('admin'), listarUsuarios);
router.put('/usuarios/:id/rol', auth, verificarRol('admin'), actualizarRol);
router.delete('/usuarios/:id', auth, verificarRol('admin'), eliminarUsuario);
router.patch('/usuarios/:id/estado', auth, verificarRol('admin'), toggleEstadoUsuario);

module.exports = router;