const { z } = require('zod');

// Definimos el esquema de validación de un agente
const registrarAgenteSchema = z.object({
  usuarioId: z.string().length(24, "usuarioId inválido (debe ser un ObjectId de MongoDB)"),
  socketId: z.string().optional().nullable(),
  ip: z.string().optional().nullable(),
  dispositivos: z.array(
    z.object({
      uid: z.string(),
      nombre: z.string(),
      fabricante: z.string().optional(),
      chip: z.string().optional(),
      path: z.string().optional(),
      imagen: z.string().optional(),
    })
  ).optional().nullable(),
  firstConnected: z.date().optional().nullable(),
  lastHeartbeat: z.date().optional().nullable(),
  isOnline: z.boolean().optional(),
});

module.exports = { registrarAgenteSchema };