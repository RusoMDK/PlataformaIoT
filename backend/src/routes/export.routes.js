// routes/export.routes.js
const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth');  // ✅ unificado
const verificarRol = require('../middlewares/rol.middleware');
const exportController = require('../controllers/export.controller');

// ✅ Exportaciones para usuarios autenticados
router.get('/lecturas/excel', requireAuth, exportController.exportarLecturasExcel);
router.get('/lecturas/pdf',   requireAuth, exportController.exportarLecturasPDF);

router.get('/mis-proyectos/csv', requireAuth, exportController.exportarMisProyectosCSV);
router.get('/mis-logs/csv',      requireAuth, exportController.exportarMisLogsCSV);

// ✅ Nuevas: exportar proyecto completo con sensores y lecturas
router.get('/proyectos/:id/excel', requireAuth, exportController.exportarProyectoCompletoExcel);
router.get('/proyectos/:id/pdf',   requireAuth, exportController.exportarProyectoCompletoPDF);

// ✅ Exportaciones solo para admin
router.get('/usuarios',  requireAuth, verificarRol('admin'), exportController.exportarUsuariosCSV);
router.get('/proyectos', requireAuth, verificarRol('admin'), exportController.exportarProyectosCSV);
router.get('/logs',      requireAuth, verificarRol('admin'), exportController.exportarLogsCSV);

module.exports = router;
