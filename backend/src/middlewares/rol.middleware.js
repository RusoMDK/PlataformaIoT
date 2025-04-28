module.exports = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ msg: 'Acceso denegado: Rol no autorizado' });
    }
    next();
  };
};