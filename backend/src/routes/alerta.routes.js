// routes/alerta.routes.js
const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth');  // ✅ unificado
const { crearAlerta, obtenerAlertas, eliminarAlerta } = require('../controllers/alerta.controller');

/**
 * @swagger
 * /alertas:
 *   post:
 *     summary: Crear una nueva alerta
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               sensor:
 *                 type: string
 *               operador:
 *                 type: string
 *               valor:
 *                 type: number
 *               unidad:
 *                 type: string
 *               mensaje:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alerta creada
 */
router.post('/',    requireAuth, crearAlerta);
router.get('/',     requireAuth, obtenerAlertas);
router.delete('/:id', requireAuth, eliminarAlerta);

module.exports = router;
