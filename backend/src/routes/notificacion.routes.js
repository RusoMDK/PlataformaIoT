// routes/notificacion.routes.js
const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth');
const csrfProtection = require('../middlewares/csrfProtection');

const {
  obtenerNotificaciones,
  obtenerNoLeidasCount,
  crearNotificacion,
  marcarComoLeida,
  marcarVariasComoLeidas,
  marcarTodasComoLeidas,
} = require('../controllers/notificacion.controller');

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Endpoints para gestionar notificaciones de usuarios
 */

// LIST + filtros + paginación
router.get('/', requireAuth, obtenerNotificaciones);

// Conteo no leídas
router.get('/unread-count', requireAuth, obtenerNoLeidasCount);

// Crear (útil para pruebas/seed manual)
router.post('/', requireAuth, csrfProtection, crearNotificacion);

// Marcar una como leída
router.patch('/:id/leida', requireAuth, csrfProtection, marcarComoLeida);

// Marcar varias (bulk)
router.patch('/mark-read-bulk', requireAuth, csrfProtection, marcarVariasComoLeidas);

// Marcar TODAS como leídas (fallback)
router.patch('/marcar-todas/leidas', requireAuth, csrfProtection, marcarTodasComoLeidas);

module.exports = router;
