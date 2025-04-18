exports.obtenerNotificaciones = async (req, res) => {
  try {
    const { pagina = 1, limite = 20, leida, tipo } = req.query;
    const filtro = { usuario: req.usuarioId };

    if (leida !== undefined) {
      filtro.leida = leida === 'true';
    }

    if (tipo) {
      filtro.tipo = tipo; // ejemplo: 'alerta', 'sistema', etc.
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const [notificaciones, total] = await Promise.all([
      Notificacion.find(filtro)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limite)),
      Notificacion.countDocuments(filtro)
    ]);

    res.status(200).json({
      notificaciones,
      total,
      pagina: parseInt(pagina),
      paginas: Math.ceil(total / parseInt(limite)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener notificaciones' });
  }
};

exports.marcarComoLeida = async (req, res) => {
  try {
    const notificacion = await Notificacion.findOne({
      _id: req.params.id,
      usuario: req.usuarioId,
    });

    if (!notificacion) {
      return res.status(404).json({ msg: "Notificación no encontrada" });
    }

    notificacion.leida = true;
    await notificacion.save();

    res.status(200).json({ msg: "Notificación marcada como leída" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al marcar como leída' });
  }
};

exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    await Notificacion.updateMany(
      { usuario: req.usuarioId, leida: false },
      { $set: { leida: true } }
    );
    res.status(200).json({ msg: "Todas las notificaciones marcadas como leídas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al marcar todas como leídas' });
  }
};