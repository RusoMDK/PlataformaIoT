// backend/src/middlewares/authRequired.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

module.exports = async (req, res, next) => {
  // Acepta cookie "token" o Authorization: Bearer <token>
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ msg: 'Token no enviado (cookie/authorization ausente)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ msg: 'Usuario no encontrado' });
    }

    req.usuarioId = usuario._id;
    req.usuario = usuario;

    // Log útil para depurar
    // console.log(`🔐 authRequired OK -> ${usuario.email} (${req.method} ${req.originalUrl})`);

    next();
  } catch (err) {
    console.warn('❌ authRequired: token inválido o expirado:', err.message);
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};
