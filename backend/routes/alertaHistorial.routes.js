const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { obtenerHistorial, obtenerHistorialFiltrado, marcarComoVista, marcarComoResuelta, obtenerHistorialPorProyecto } = require('../controllers/alertaHistorial.controller');
/**
 * @swagger
 * /alertas/historial:
 *   get:
 *     summary: Obtener historial completo de alertas activadas
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas activadas
 */
router.get('/', auth, obtenerHistorial);
/**
 * @swagger
 * /alertas/historial/filtro:
 *   get:
 *     summary: Filtrar historial de alertas por sensor o proyecto
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sensor
 *         in: query
 *         schema:
 *           type: string
 *       - name: proyecto
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de alertas filtradas
 */
router.get('/filtro', auth, obtenerHistorialFiltrado);
/**
 * @swagger
 * /alertas/historial/{id}/vista:
 *   patch:
 *     summary: Marcar alerta como vista
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alerta marcada como vista
 */
router.patch('/:id/vista', auth, marcarComoVista);
/**
 * @swagger
 * /alertas/historial/{id}/resuelta:
 *   patch:
 *     summary: Marcar alerta como resuelta
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alerta marcada como resuelta
 */
router.patch('/:id/resuelta', auth, marcarComoResuelta);

router.get('/proyecto', auth, obtenerHistorialPorProyecto);

module.exports = router;