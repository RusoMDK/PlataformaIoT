const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const {
  crearVisualizacion,
  obtenerVisualizaciones,
  actualizarVisualizacion,
  eliminarVisualizacion
} = require('../controllers/visualizacion.controller');

// 📊 Crear nueva visualización personalizada
router.post('/', auth, crearVisualizacion);

// 📊 Obtener visualizaciones por proyecto
router.get('/', auth, obtenerVisualizaciones);

// 📝 Actualizar visualización existente
router.put('/:id', auth, actualizarVisualizacion);

// ❌ Eliminar visualización
router.delete('/:id', auth, eliminarVisualizacion);

module.exports = router;
