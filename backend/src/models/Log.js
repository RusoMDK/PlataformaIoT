// src/models/Log.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Log enriquecido con compatibilidad hacia atrás:
 * - Nuevo: level, module, action, message, detail, ts
 * - Compat: accion, detalle, fecha (si hay registros viejos)
 */
const LogSchema = new Schema(
  {
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },

    // Esquema "nuevo"
    level:  { type: String, trim: true, lowercase: true, default: 'info' }, // info|warn|error|success|debug...
    module: { type: String, trim: true, lowercase: true, default: '' },     // origen
    action: { type: String, trim: true, lowercase: true, default: '' },     // acción breve
    message:{ type: String, trim: true, default: '' },                      // descripción principal
    detail: { type: Schema.Types.Mixed, default: null },                    // payload opcional
    ts:     { type: Date, default: Date.now, index: true },                 // timestamp principal

    // Compat con registros antiguos (si existían)
    accion:  { type: String, trim: true, default: undefined },
    detalle: { type: String, trim: true, default: undefined },
    fecha:   { type: Date,   default: undefined },
  },
  { timestamps: true, versionKey: false }
);

/* ────────────────────────────────────────────────────────────────────────────
   ÍNDICES
──────────────────────────────────────────────────────────────────────────── */
LogSchema.index({ usuario: 1, ts: -1 });
LogSchema.index({ usuario: 1, level: 1, ts: -1 });
LogSchema.index({ usuario: 1, module: 1, ts: -1 });
LogSchema.index({ usuario: 1, action: 1, ts: -1 });

// Búsqueda simple
LogSchema.index({ message: 'text', action: 'text', module: 'text' });

// TTL opcional (NO duplica índice porque es ts:1; los anteriores usan ts:-1 o campos compuestos)
const ttlDays = Number(process.env.LOG_TTL_DAYS ?? 0);
if (Number.isFinite(ttlDays) && ttlDays > 0) {
  LogSchema.index({ ts: 1 }, { expireAfterSeconds: Math.round(ttlDays * 86400) });
}

/* ────────────────────────────────────────────────────────────────────────────
   NORMALIZACIÓN Y BACKFILL (compat ⇄ nuevo)
──────────────────────────────────────────────────────────────────────────── */
function lc(s) {
  return typeof s === 'string' ? s.trim().toLowerCase() : '';
}

LogSchema.pre('validate', function normalizeFields() {
  // Completar nuevos desde legacy si faltan
  if (!this.message && this.accion) this.message = this.accion;
  if (this.detail == null && this.detalle != null) this.detail = this.detalle;
  if (!this.ts && this.fecha) this.ts = this.fecha;

  // Completar legacy desde nuevos (útil si alguna parte vieja lee esos campos)
  if (!this.accion && this.action) this.accion = this.action;
  if (!this.detalle && this.detail != null) this.detalle = typeof this.detail === 'string' ? this.detail : JSON.stringify(this.detail);
  if (!this.fecha && this.ts) this.fecha = this.ts;

  // Lowercase consistentes
  this.level  = lc(this.level)  || 'info';
  this.module = lc(this.module);
  this.action = lc(this.action);
});

LogSchema.pre('save', function ensureTs() {
  if (!this.ts) this.ts = new Date();
});

/* ────────────────────────────────────────────────────────────────────────────
   SALIDA UNIFICADA PARA EL FRONTEND
   - Siempre entrega { _id, usuario, level, module, action, message, detail, ts }
   - Legacy ocultos por defecto (puedes exponerlos si pones EXPOSE_LEGACY_LOG_FIELDS=true)
──────────────────────────────────────────────────────────────────────────── */
const exposeLegacy = String(process.env.EXPOSE_LEGACY_LOG_FIELDS || '').toLowerCase() === 'true';

LogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    // Unificar
    ret.level  = lc(ret.level)  || 'info';
    ret.module = lc(ret.module);
    ret.action = lc(ret.action);
    ret.message = ret.message || ret.accion || '';
    if (ret.detail == null && ret.detalle != null) {
      ret.detail = ret.detalle;
    }
    ret.ts = ret.ts || ret.fecha || ret.createdAt;

    // Oculta legacy salvo que se pida expresamente
    if (!exposeLegacy) {
      delete ret.accion;
      delete ret.detalle;
      delete ret.fecha;
      delete ret.createdAt;
      delete ret.updatedAt;
    }
    return ret;
  }
});

/* ────────────────────────────────────────────────────────────────────────────
   ESTÁTICOS ÚTILES
──────────────────────────────────────────────────────────────────────────── */
/**
 * Crea un log con mapeo flexible de nombres:
 * Log.createSafe({ usuario, level, module, action, message, detail, ts })
 * Log.createSafe({ usuario, accion, detalle, fecha }) // legacy
 */
LogSchema.statics.createSafe = function createSafe(payload = {}) {
  const doc = {
    usuario: payload.usuario,
    level:   payload.level ?? payload.nivel ?? 'info',
    module:  payload.module ?? payload.modulo ?? '',
    action:  payload.action ?? payload.accion ?? '',
    message: payload.message ?? payload.mensaje ?? payload.accion ?? '',
    detail:  payload.detail  ?? payload.detalle ?? null,
    ts:      payload.ts ?? payload.fecha ?? new Date(),
  };
  return this.create(doc);
};

module.exports = mongoose.models.Log || mongoose.model('Log', LogSchema);
