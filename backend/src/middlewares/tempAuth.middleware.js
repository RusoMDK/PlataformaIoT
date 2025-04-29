const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Token no enviado (authorization header no encontrado)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ msg: 'Usuario no encontrado' });
    }

    req.usuarioId = usuario._id;
    req.usuario = usuario;

    console.log(`🔐 Usuario autenticado temporalmente: ${usuario._id} (${usuario.email || 'sin email'}) → Ruta: ${req.method} ${req.originalUrl}`);

    next();
  } catch (err) {
    console.warn("❌ Error de autenticación temporal:", err.message);
    res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};