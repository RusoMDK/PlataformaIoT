// backend/src/routes/usuarios.routes.js
const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuarios.controller');  // ← IMPORTAR el controlador
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload'); // tu middleware de Multer+Cloudinary

// Todas estas rutas requieren estar autenticado:
router.use(authMiddleware);

// GET  /api/usuarios/me
router.get('/me', usuariosController.getProfile);

// PUT  /api/usuarios/me  (termina en /me, y aquí recibes FormData con campo 'fotoPerfil')
router.put(
  '/me',
  upload.single('fotoPerfil'),
  usuariosController.updateCuenta
);

// PUT  /api/usuarios/me/password
router.put('/me/password', usuariosController.changePassword);

// DELETE  /api/usuarios/me
router.delete('/me', usuariosController.deleteAccount);

module.exports = router;