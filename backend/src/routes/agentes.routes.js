// backend/routes/agentes.routes.js
const express = require('express');
const router  = express.Router();

const requireAuth = require('../middlewares/requireAuth');   // ✅ unificado
const rol         = require('../middlewares/rol.middleware');

const {
  listarAgentes,
  exportarAgentesExcel,
  obtenerAgentesActivos,
  listarHistorialAgentes
} = require('../controllers/agentes.controller');

router.get('/',                requireAuth, rol('admin'), listarAgentes);
router.get('/exportar',        requireAuth, rol('admin'), exportarAgentesExcel);
router.get('/agentes-activos', requireAuth, rol('admin'), obtenerAgentesActivos);
router.get('/historial',       requireAuth, rol('admin'), listarHistorialAgentes);

module.exports = router;
