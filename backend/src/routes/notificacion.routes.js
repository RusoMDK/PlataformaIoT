const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas
} = require('../controllers/notificacion.controller');

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Endpoints para gestionar notificaciones de usuarios
 */

/**
 * @swagger
 * /notificaciones:
 *   get:
 *     summary: Obtener todas las notificaciones del usuario
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: leida
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de lectura
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de notificación
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Página para paginación
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de notificaciones del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', auth, obtenerNotificaciones);

/**
 * @swagger
 * /notificaciones/{id}/leida:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 */
router.patch('/:id/leida', auth, marcarComoLeida);

/**
 * @swagger
 * /notificaciones/marcar-todas/leidas:
 *   patch:
 *     summary: Marcar todas las notificaciones del usuario como leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 */
router.patch('/marcar-todas/leidas', auth, marcarTodasComoLeidas);

module.exports = router;
