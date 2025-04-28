// src/validations/usuarios.validation.js
const { z } = require('zod');

// Permite URL válidas o cadena vacía / undefined
const urlOrEmpty = z.string().url().or(z.literal('')).optional();

// —— ESQUEMA PARA fotoPerfil, bio y redes ——
const updateBasicProfileSchema = z.object({
  bio: z.string().max(1000).optional(),         // aumentamos a 1000
  redes: z
    .object({
      github:   urlOrEmpty,
      linkedin: urlOrEmpty,
      twitter:  urlOrEmpty,
      website:  urlOrEmpty,
    })
    .optional(),
});

// —— ESQUEMA PARA datos personales ——
const updatePersonalInfoSchema = z.object({
  primerNombre:    z.string().optional(),
  segundoNombre:   z.string().optional(),
  primerApellido:  z.string().optional(),
  segundoApellido: z.string().optional(),
  apodo:           z.string().optional(),
  prefijoTelefono: z.string().optional(),
  telefono:        z.string().optional(),
  direccion: z
    .object({
      pais:         z.string().optional(),
      ciudad:       z.string().optional(),
      calle:        z.string().optional(),
      numero:       z.string().optional(),
      codigoPostal: z.string().optional(),
    })
    .optional(),
  fechaNacimiento: z
    .string()
    .refine((s) => !s || !isNaN(Date.parse(s)), { message: 'Fecha inválida' })
    .optional(),
  genero:       z.enum(['masculino', 'femenino', 'otro']).optional(),
  estadoCivil:  z.enum(['soltero', 'casado', 'otro']).optional(),
  nacionalidad: z.string().optional(),
});

// —— ESQUEMA UNIFICADO PARA ACTUALIZAR CUENTA ——
const updateCuentaSchema = updateBasicProfileSchema.merge(updatePersonalInfoSchema);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword:     z.string().min(6),
});

module.exports = {
  updateBasicProfileSchema,
  updatePersonalInfoSchema,
  updateCuentaSchema,
  changePasswordSchema,
};