// src/middlewares/validate.js
const { z } = require('zod');

function validate(schema, where = 'body') {
  return (req, res, next) => {
    try {
      const data = schema.parse(req[where] ?? {});
      req[where] = data; // normaliza (p.ej. booleans/strings)
      next();
    } catch (err) {
      return res.status(400).json({
        error: 'validation_error',
        details: err.errors?.map(e => ({ path: e.path, message: e.message })) ?? String(err),
      });
    }
  };
}

// Esquemas base
const desiredSchema = z.object({
  desired: z.record(z.union([z.string(), z.number(), z.boolean()])).refine(
    obj => Object.keys(obj).length > 0,
    { message: 'desired no puede estar vacío' }
  )
});

const commandSchema = z.object({
  cmd: z.string().min(1),
  args: z.record(z.any()).optional().default({})
});

module.exports = { validate, desiredSchema, commandSchema };
