// src/routes/proyecto.routes.js
const express = require('express');
const router = express.Router();

const requireAuth = require('../middlewares/requireAuth'); // ✅ unificado
const {
  crearProyecto,
  obtenerProyectos,
  obtenerResumenProyecto,
  actualizarProyecto,
  eliminarProyecto,
  obtenerProyectoPorId
} = require('../controllers/proyecto.controller');

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

router.post('/', requireAuth, crearProyecto);
router.get('/', requireAuth, obtenerProyectos);
router.get('/:id/resumen', requireAuth, obtenerResumenProyecto);
router.put('/:id', requireAuth, actualizarProyecto);

// Leer/eliminar proyecto por id
router.get('/:id', requireAuth, obtenerProyectoPorId);
router.delete('/:id', requireAuth, eliminarProyecto);

module.exports = router;
