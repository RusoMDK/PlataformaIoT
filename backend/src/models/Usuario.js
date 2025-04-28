const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
  primerNombre:   { type: String, trim: true, required: true },
  segundoNombre:  { type: String, trim: true },
  primerApellido: { type: String, trim: true, required: true },
  segundoApellido:{ type: String, trim: true },
  apodo:          { type: String, trim: true },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Formato de email inválido"],
  },
  password: { type: String, required: true, minlength: 6, select: false },
  rol: { type: String, enum: ['admin','usuario'], default: 'usuario' },
  activo: { type: Boolean, default: true },

  fotoPerfil: { type: String, default: '/assets/profile-placeholder.png' },
  bio:        { type: String, maxlength: 1000, default: '' },
  genero:     { type: String, enum: ['masculino','femenino','otro'], default: 'otro' },
  estadoCivil:{ type: String, enum: ['soltero','casado','otro'], default: 'soltero' },
  fechaNacimiento: { type: Date },

  telefono:       { type: String, default: '' },
  prefijoTelefono:{ type: String, default: '' },
  direccion: {
    pais:         { type: String, default: '' },
    ciudad:       { type: String, default: '' },
    calle:        { type: String, default: '' },
    numero:       { type: String, default: '' },
    codigoPostal: { type: String, default: '' },
  },
  nacionalidad: { type: String, default: '' },

  redes: {
    github:   { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter:  { type: String, default: '' },
    website:  { type: String, default: '' },
  },

  preferencias: {
    temaUI:          { type: String, enum: ['light','dark','system'], default: 'light' },
    notificaciones:  { type: Boolean, default: true },
  },

  actividadReciente: [{ accion: String, fecha: Date, ip: String }],
  ultimoLogin:      { type: Date },
  ipUltimoLogin:    { type: String },
  creadoEn:         { type: Date, default: Date.now },

  resetPasswordToken:   String,
  resetPasswordExpires: Date,
});

usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

usuarioSchema.methods.compararPassword = function(pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);