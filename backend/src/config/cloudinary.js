// src/config/cloudinary.js
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Si usas CLOUDINARY_URL, esta llamada es opcional:
// cloudinary.config(); 
// porque el SDK lo lee automáticamente de la variable de entorno.

// Si quieres (o usas variables separadas), hazlo así:
cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;