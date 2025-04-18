const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'Token no enviado' });

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(401).json({ msg: 'Usuario no encontrado' });

    req.usuarioId = usuario._id;
    req.usuario = usuario; // 👈 Guardamos usuario completo en la request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};