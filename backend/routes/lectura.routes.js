const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { crearLectura, obtenerLecturasPorSensor, obtenerLecturasOptimizado } = require('../controllers/lectura.controller');

/**
 * @swagger
 * /lecturas:
 *   post:
 *     summary: Crear nueva lectura de sensor
 *     tags: [Lecturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sensor:
 *                 type: string
 *               valor:
 *                 type: number
 *               unidad:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lectura creada
 */
// Crear lectura
router.post('/', auth, crearLectura);
/**
 * @swagger
 * /lecturas:
 *   get:
 *     summary: Obtener lecturas por sensor
 *     tags: [Lecturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sensor
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de lecturas
 */
// Obtener lecturas por sensor
router.get('/', auth, obtenerLecturasPorSensor);

router.get('/optimizado', auth, obtenerLecturasOptimizado);

module.exports = router;