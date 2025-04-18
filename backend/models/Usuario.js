const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
  activo: { type: Boolean, default: true }
});

// Hashear el password antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = function (passwordIngresado) {
  return bcrypt.compare(passwordIngresado, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);