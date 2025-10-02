const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Lectura (telemetría)
 */
const lecturaSchema = new Schema(
  {
    // --- Core series ---
    ts: {
      type: Date,
      default: Date.now,
      // ❌ quitamos index:true aquí para no chocar con el TTL/normal de abajo
      // index: true,
    },
    deviceId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
      index: true,
    },
    sensorId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => Number.isFinite(v),
        message: 'value debe ser un número finito',
      },
    },
    unit: {
      type: String,
      trim: true,
      maxlength: 24,
      default: undefined,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: undefined,
    },

    // --- Contexto opcional ---
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Proyecto',
      default: undefined,
      index: true,
    },
    tenantId: {
      type: Schema.Types.Mixed,
      default: undefined,
      index: true,
    },

    // --- Compatibilidad con tu esquema previo ---
    sensor: {
      type: Schema.Types.ObjectId,
      ref: 'Sensor',
      default: undefined,
      index: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      default: undefined,
      index: true,
    },
  },
  {
    timestamps: false, // usamos 'ts'
    versionKey: false,
  }
);

/** Índice compuesto recomendado */
lecturaSchema.index({ deviceId: 1, sensorId: 1, ts: -1 });

/** TTL/índice de ts SIN duplicación */
const ttlDays = Number(process.env.LECTURA_TTL_DAYS ?? 30);

// Si TTL > 0 => índice TTL; si no, índice normal sobre ts
if (Number.isFinite(ttlDays) && ttlDays > 0) {
  lecturaSchema.index(
    { ts: 1 },
    { expireAfterSeconds: Math.round(ttlDays * 24 * 60 * 60) }
  );
} else {
  lecturaSchema.index({ ts: 1 });
}

/** Helpers */
function normalizeSensorId(sensorId) {
  if (!sensorId || typeof sensorId !== 'string') return 'unknown';
  const s = sensorId.trim().toLowerCase();
  return s.length ? s : 'unknown';
}

lecturaSchema.statics.addReading = async function addReading(doc) {
  const {
    ts = new Date(),
    deviceId,
    sensorId,
    value,
    unit,
    meta,
    projectId,
    tenantId,
    sensor,
    usuario,
  } = doc || {};

  if (!deviceId) throw new Error('deviceId requerido');
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('value debe ser número finito');
  }

  const payload = {
    ts: new Date(ts),
    deviceId: String(deviceId).toLowerCase(),
    sensorId: normalizeSensorId(sensorId),
    value,
    unit,
    meta,
  };

  if (projectId) payload.projectId = projectId;
  if (tenantId) payload.tenantId = tenantId;
  if (sensor) payload.sensor = sensor;
  if (usuario) payload.usuario = usuario;

  return this.create(payload);
};

lecturaSchema.statics.getLatest = async function getLatest({ deviceId, sensorId }) {
  if (!deviceId) throw new Error('deviceId requerido');
  const query = { deviceId: String(deviceId).toLowerCase() };
  if (sensorId) query.sensorId = normalizeSensorId(sensorId);
  return this.findOne(query).sort({ ts: -1 }).lean();
};

lecturaSchema.statics.downsample = async function downsample({
  deviceId,
  sensorId,
  from,
  to,
  window = '5m',
}) {
  if (!deviceId || !sensorId) throw new Error('deviceId y sensorId requeridos');

  const msMap = { '1m': 60e3, '5m': 300e3, '15m': 900e3, '1h': 3600e3, '1d': 86400e3 };
  const winMs = msMap[window] ?? 300e3;

  const match = {
    deviceId: String(deviceId).toLowerCase(),
    sensorId: normalizeSensorId(sensorId),
  };
  if (from) match.ts = Object.assign(match.ts || {}, { $gte: new Date(from) });
  if (to) match.ts = Object.assign(match.ts || {}, { $lte: new Date(to) });

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $toLong: { $subtract: [{ $toLong: '$ts' }, { $mod: [{ $toLong: '$ts' }, winMs] }] } },
        ts: { $min: '$ts' },
        avg: { $avg: '$value' },
        min: { $min: '$value' },
        max: { $max: '$value' },
        count: { $sum: 1 },
      },
    },
    { $sort: { ts: 1 } },
  ]);
};

module.exports = mongoose.models.Lectura || mongoose.model('Lectura', lecturaSchema);
