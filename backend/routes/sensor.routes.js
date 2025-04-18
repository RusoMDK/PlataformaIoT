const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { crearSensor, obtenerSensores, eliminarSensoresPorProyecto } = require('../controllers/sensor.controller');


/**
 * @swagger
 * /sensores:
 *   post:
 *     summary: Crear un nuevo sensor
 *     tags: [Sensores]
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
 *               tipo:
 *                 type: string
 *               pin:
 *                 type: string
 *               unidad:
 *                 type: string
 *               proyecto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sensor creado
 */
router.post('/', auth, crearSensor);

/**
 * @swagger
 * /sensores:
 *   get:
 *     summary: Obtener sensores por proyecto
 *     tags: [Sensores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: proyecto
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Lista de sensores
 */
router.get('/', auth, obtenerSensores); // <-- 🔥 Este es el que te falta

router.delete('/proyecto/:proyectoId', auth, eliminarSensoresPorProyecto);

module.exports = router;