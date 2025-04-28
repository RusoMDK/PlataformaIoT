const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const verificarRol = require('../middlewares/rol.middleware');
const { obtenerLogsUsuario, obtenerLogsGlobales, eliminarVariosLogs } = require('../controllers/log.controller');

// Logs del usuario
router.get('/', auth, obtenerLogsUsuario);

// Logs globales (admin)
router.get('/globales', auth, verificarRol('admin'), obtenerLogsGlobales);

router.post("/eliminar-varios", auth, eliminarVariosLogs)

module.exports = router;