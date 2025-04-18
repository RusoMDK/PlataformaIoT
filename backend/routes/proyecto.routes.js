const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { crearProyecto, obtenerProyectos, obtenerResumenProyecto, actualizarProyecto, eliminarProyecto } = require('../controllers/proyecto.controller');

/**
 * @swagger
 * /proyectos:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
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
 *               descripcion:
 *                 type: string
 *               placa:
 *                 type: string
 *               sensores:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Proyecto creado
 *       400:
 *         description: Datos inválidos
 */

router.post('/', auth, crearProyecto);
router.get('/', auth, obtenerProyectos);
const { obtenerProyectoPorId } = require('../controllers/proyecto.controller');
router.get('/:id/resumen', auth, obtenerResumenProyecto);
router.put('/:id', auth, actualizarProyecto); 

// ... tus otras rutas
router.get('/:id', auth, obtenerProyectoPorId); // <-- Esta es la que faltaba
router.delete('/:id', auth, eliminarProyecto);

module.exports = router;