// src/routes/visualizacion.routes.js
const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth'); // ✅ unificado
const {
  crearVisualizacion,
  obtenerVisualizaciones,
  actualizarVisualizacion,
  eliminarVisualizacion
} = require('../controllers/visualizacion.controller');

// 📊 Crear nueva visualización personalizada
router.post('/', requireAuth, crearVisualizacion);

// 📊 Obtener visualizaciones por proyecto
router.get('/', requireAuth, obtenerVisualizaciones);

// 📝 Actualizar visualización existente
router.put('/:id', requireAuth, actualizarVisualizacion);

// ❌ Eliminar visualización
router.delete('/:id', requireAuth, eliminarVisualizacion);

module.exports = router;
