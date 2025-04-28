const Usuario = require('../models/Usuario');
const { updateCuentaSchema, changePasswordSchema } = require('../validations/usuarios.validation');
const { ZodError } = require('zod');   // ← IMPORTAR ZodError

// GET /api/usuarios/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await Usuario.findById(req.usuarioId).select('-password');
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ usuario: user });
  } catch (err) {
    next(err);
  }
};

exports.updateCuenta = async (req, res, next) => {
  try {
    // 1) Pre-parseamos los campos que vienen como JSON strings en form-data
    const payload = { ...req.body };
    if (typeof payload.redes === 'string') {
      try {
        payload.redes = JSON.parse(payload.redes);
      } catch (e) {
        // si no es JSON válido, lo dejamos como está y lo capturará Zod
      }
    }

    // 2) Validamos con Zod
    const data = updateCuentaSchema.parse(payload);

    // 3) Si hay foto de perfil subida por multer+Cloudinary:
    if (req.file && req.file.path) {
      data.fotoPerfil = req.file.path;
    }

    // 4) Convertimos fechaNacimiento a Date
    if (data.fechaNacimiento) {
      data.fechaNacimiento = new Date(data.fechaNacimiento);
    }

    // 5) Mapeamos manualmente los campos planos de dirección (si vinieron)
    const { country, city, street, numero, postalCode } = payload;
    if (country || city || street || numero || postalCode) {
      data.direccion = {
        pais:         country     || '',
        ciudad:       city        || '',
        calle:        street      || '',
        numero:       numero      || '',
        codigoPostal: postalCode  || '',
      };
    }

    // 6) Hacemos el update en Mongo
    const updated = await Usuario.findByIdAndUpdate(
      req.usuarioId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    return res.json({ usuario: updated });
  } catch (err) {
    if (err instanceof ZodError) {
      console.error('❌ Zod validation failed on updateCuenta:', err.errors);
      return res.status(400).json({ errores: err.errors });
    }
    next(err);
  }
};

// PUT /api/usuarios/me/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Usuario.findById(req.usuarioId).select('+password');
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    const valid = await user.compararPassword(currentPassword);
    if (!valid) return res.status(400).json({ msg: 'Contraseña actual incorrecta' });
    user.password = newPassword;
    await user.save();
    res.json({ msg: 'Contraseña actualizada' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/usuarios/me
exports.deleteAccount = async (req, res, next) => {
  try {
    await Usuario.findByIdAndDelete(req.usuarioId);
    res.json({ msg: 'Cuenta eliminada' });
  } catch (err) {
    next(err);
  }
};