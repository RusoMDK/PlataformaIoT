// backend/src/routes/usuarios.routes.js
const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuarios.controller');
const requireAuth = require('../middlewares/requireAuth'); // ✅ unificado
const upload = require('../middlewares/upload'); // Multer + Cloudinary

// Todas requieren autenticación
router.use(requireAuth);

// GET  /api/usuarios/me
router.get('/me', usuariosController.getProfile);

// PUT  /api/usuarios/me (FormData con 'fotoPerfil')
router.put('/me', upload.single('fotoPerfil'), usuariosController.updateCuenta);

// PUT  /api/usuarios/me/password
router.put('/me/password', usuariosController.changePassword);

// DELETE  /api/usuarios/me
router.delete('/me', usuariosController.deleteAccount);

module.exports = router;
