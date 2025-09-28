// src/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema(
  {
    // === Autenticación base ===
    username: {
      type: String,
      required: [true, 'username requerido'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9._-]+$/i, // letras, números, ".", "_" y "-"
    },

    email: {
      type: String,
      unique: true,
      required: [true, 'email requerido'],
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Formato de email inválido'],
    },

    password: { type: String, required: true, minlength: 6, select: false },

    // Roles: alineado con el backend (user/admin)
    rol: { type: String, enum: ['user', 'admin'], default: 'user' },
    activo: { type: Boolean, default: true },

    // === Perfil (OPCIONAL) ===
    // nombre completo opcional
    nombre: { type: String, trim: true, default: '' },

    // nombres desglosados (opcionales)
    primerNombre:   { type: String, trim: true, default: '' },
    segundoNombre:  { type: String, trim: true, default: '' },
    primerApellido: { type: String, trim: true, default: '' },
    segundoApellido:{ type: String, trim: true, default: '' },

    apodo:          { type: String, trim: true, default: '' },

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

    // === 2FA ===
    twoFactorTempSecret: { type: String, select: false },
    twoFactorSecret:     { type: String, select: false },
    is2FAEnabled:        { type: Boolean, default: false },

    // === Auditoría ===
    actividadReciente: [{ accion: String, fecha: Date, ip: String }],
    ultimoLogin:      { type: Date },
    ipUltimoLogin:    { type: String },

    // === Metadatos ===
    creadoEn:         { type: Date, default: Date.now },

    // === Recuperación de contraseña ===
    resetPasswordToken:   String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Índices
usuarioSchema.index({ username: 1 }, { unique: true });
usuarioSchema.index({ email: 1 }, { unique: true });

// Hash automático del password si cambia
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar passwords
usuarioSchema.methods.compararPassword = function (pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
