// src/middlewares/requireAuth.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Middleware de autenticación unificado:
 * - Acepta cookie "token" o header "Authorization: Bearer <token>"
 * - Verifica JWT y carga Usuario
 * - Expone req.user (estándar) y mantiene compat: req.usuario, req.usuarioId
 */
module.exports = async function requireAuth(req, res, next) {
  try {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers?.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    const token = cookieToken || bearerToken;
    if (!token) {
      return res.status(401).json({ msg: 'Token no enviado (cookie/authorization ausente)' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ msg: 'Usuario no encontrado' });
    }

    // Estándar:
    req.user = { _id: usuario._id, email: usuario.email };

    // Compatibilidad con código existente:
    req.usuario = usuario;
    req.usuarioId = usuario._id;

    // Log útil (silenciar en prod si quieres)
    // console.log(`🔐 Auth OK: ${usuario.email} → ${req.method} ${req.originalUrl}`);

    next();
  } catch (err) {
    console.warn('❌ requireAuth: token inválido/expirado:', err.message);
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};
