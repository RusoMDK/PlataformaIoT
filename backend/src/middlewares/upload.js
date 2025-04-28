// src/middlewares/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'perfil_usuarios',
    format: async (req, file) => file.mimetype.split('/')[1],
    public_id: (req, file) => `usuario_${req.usuarioId}_${Date.now()}`,
  },
});

module.exports = multer({ storage });