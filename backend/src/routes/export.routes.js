// routes/export.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');
const exportController = require('../controllers/export.controller');

// ✅ Exportaciones para usuarios autenticados
router.get('/lecturas/excel', auth, exportController.exportarLecturasExcel);
router.get('/lecturas/pdf', auth, exportController.exportarLecturasPDF);

router.get('/mis-proyectos/csv', auth, exportController.exportarMisProyectosCSV);
router.get('/mis-logs/csv', auth, exportController.exportarMisLogsCSV);

// ✅ NUEVAS: exportar proyecto completo con sensores y lecturas
router.get('/proyectos/:id/excel', auth, exportController.exportarProyectoCompletoExcel);
router.get('/proyectos/:id/pdf', auth, exportController.exportarProyectoCompletoPDF);

// ✅ Exportaciones solo para admin
router.get('/usuarios', auth, verificarRol('admin'), exportController.exportarUsuariosCSV);
router.get('/proyectos', auth, verificarRol('admin'), exportController.exportarProyectosCSV);
router.get('/logs', auth, verificarRol('admin'), exportController.exportarLogsCSV);

module.exports = router;