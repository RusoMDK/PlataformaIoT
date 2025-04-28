// backend/routes/agentes.routes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth.middleware');
const rol     = require('../middlewares/rol.middleware');

const {
  listarAgentes,
  exportarAgentesExcel,
  obtenerAgentesActivos,
  listarHistorialAgentes
} = require('../controllers/agentes.controller');

router.get(   '/',               auth, rol('admin'), listarAgentes       );
router.get(   '/exportar',       auth, rol('admin'), exportarAgentesExcel);
router.get(   '/agentes-activos',auth, rol('admin'), obtenerAgentesActivos);
router.get(   '/historial',      auth, rol('admin'), listarHistorialAgentes);

module.exports = router;