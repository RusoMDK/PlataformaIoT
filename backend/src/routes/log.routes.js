const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth');
const verificarRol = require('../middlewares/rol.middleware');
const csrfProtection = require('../middlewares/csrfProtection');

const {
  obtenerLogs,
  obtenerLogsGlobales,
  exportarCSV,
  eliminarVariosLogs,
  crearLogManual,
} = require('../controllers/log.controller');

/**
 * Rutas de logs
 * - Todas protegidas con requireAuth
 * - Mutaciones protegidas con CSRF
 */

// Mis logs (actor) – compat: '/' y '/usuario'
router.get('/', requireAuth, obtenerLogs);
router.get('/usuario', requireAuth, obtenerLogs);

// Export CSV (mis logs)
router.get('/export.csv', requireAuth, exportarCSV);

// Logs globales (admin)
router.get('/globales', requireAuth, verificarRol('admin'), obtenerLogsGlobales);

// Borrado en lote (mis logs)
router.post('/eliminar-varios', requireAuth, csrfProtection, eliminarVariosLogs);

// (Opcional) Crear log manual (restringido a admin para pruebas)
router.post('/', requireAuth, verificarRol('admin'), csrfProtection, crearLogManual);

module.exports = router;
