// backend/src/models/Dispositivo.js
const mongoose = require("mongoose");
const crypto = require("crypto");

// ── helpers ───────────────────────────────────────────────────────────────────
function sha256Base64(str) {
  return crypto.createHash("sha256").update(str).digest("base64");
}
function randomToken(len = 24) {
  return crypto.randomBytes(len).toString("base64url");
}
function buildDeviceUsername(projectOrUserId, deviceId) {
  return `u:${String(projectOrUserId)}:d:${String(deviceId)}`;
}

// Hash de credenciales con scrypt (sin dependencias externas)
function scryptHash(password) {
  // parámetros estándar y seguros
  const N = 16384, r = 8, p = 1, keylen = 32;
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, keylen, { N, r, p });
  const enc = (b) => Buffer.from(b).toString("base64");
  return `scrypt$N=${N}$r=${r}$p=${p}$${enc(salt)}$${enc(key)}`;
}

// (opcional) verificación para servidores que vayan a validar el password
function scryptVerify(password, stored) {
  try {
    const [alg, nPart, rPart, pPart, saltB64, keyB64] = stored.split("$");
    if (alg !== "scrypt") return false;
    const N = parseInt(nPart.split("=")[1], 10);
    const r = parseInt(rPart.split("=")[1], 10);
    const p = parseInt(pPart.split("=")[1], 10);
    const salt = Buffer.from(saltB64, "base64");
    const key = Buffer.from(keyB64, "base64");
    const calc = crypto.scryptSync(password, salt, key.length, { N, r, p });
    return crypto.timingSafeEqual(calc, key);
  } catch {
    return false;
  }
}

// ── subdocumentos ─────────────────────────────────────────────────────────────
const ProvisionSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["pending", "active", "revoked"], default: "pending" },

    // claim de onboarding (solo guardamos HASH + expiración)
    claimTokenHash: { type: String, default: null },
    claimExpiresAt: { type: Date, default: null },

    // credenciales del dispositivo (solo hash)
    credentials: {
      type: {
        type: String,
        enum: ["mqtt"],
        default: "mqtt",
      },
      username: { type: String, default: null },
      passwordHash: { type: String, default: null }, // scrypt$...
      createdAt: { type: Date, default: null },
      rotatedAt: { type: Date, default: null },
    },
  },
  { _id: false }
);

const EstadoSchema = new mongoose.Schema(
  {
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
    ip: { type: String, default: null },
    rssi: { type: Number, default: null },
    fw: { type: String, default: null },
  },
  { _id: false }
);

// ── schema principal ──────────────────────────────────────────────────────────
const dispositivoSchema = new mongoose.Schema({
  uid: { type: String, required: true, lowercase: true },
  nombre: { type: String, required: true },
  fabricante: { type: String, default: "Desconocido" },
  path: { type: String },
  chip: { type: String },
  vendorId: { type: String },
  ipUltimaConexion: { type: String },
  productId: { type: String },
  imagen: { type: String, default: "generic.png" },

  // Legacy (mejor tenerlo global); se mantienen por compatibilidad
  mqttServer: { type: String },
  mqttPort: { type: Number },
  mqttUser: { type: String },
  mqttPass: { type: String },

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },

  ultimaConexion: { type: Date, default: Date.now },
  creadoEn: { type: Date, default: Date.now },
  configurado: { type: Boolean, default: false },

  sensores: [
    {
      id: String,
      nombre: String,
      tipo: String,
      unidad: String,
      pin: String,
      configuracion: Object,
    },
  ],

  provision: { type: ProvisionSchema, default: () => ({}) },
  estado: { type: EstadoSchema, default: () => ({}) },
});

// ── índices ───────────────────────────────────────────────────────────────────
dispositivoSchema.index({ uid: 1, usuario: 1 }, { unique: true });
dispositivoSchema.index(
  { "provision.credentials.username": 1 },
  { unique: true, sparse: true }
);

// ── hooks ─────────────────────────────────────────────────────────────────────
dispositivoSchema.pre("save", function (next) {
  this.ultimaConexion = new Date();
  next();
});

// ── métodos de dominio ────────────────────────────────────────────────────────
dispositivoSchema.methods.issueClaim = async function (ttlMs = 15 * 60 * 1000) {
  const claimToken = randomToken(24);
  this.provision.status = "pending";
  this.provision.claimTokenHash = sha256Base64(claimToken);
  this.provision.claimExpiresAt = new Date(Date.now() + ttlMs);
  await this.save();
  return { claimToken, expiresAt: this.provision.claimExpiresAt };
};

dispositivoSchema.methods.rotateCredentials = async function () {
  if (!this.provision.credentials.username) {
    this.provision.credentials.username = buildDeviceUsername(this.usuario, this._id);
  }
  const passwordPlain = randomToken(16);
  const passwordHash = scryptHash(passwordPlain);

  this.provision.status = "active";
  this.provision.claimTokenHash = null;
  this.provision.claimExpiresAt = null;
  this.provision.credentials.passwordHash = passwordHash;
  if (!this.provision.credentials.createdAt) this.provision.credentials.createdAt = new Date();
  this.provision.credentials.rotatedAt = new Date();

  await this.save();
  return { username: this.provision.credentials.username, passwordPlain };
};

dispositivoSchema.methods.setOnline = async function ({ ip, rssi, fw } = {}) {
  this.estado.online = true;
  this.estado.lastSeen = new Date();
  if (ip) this.estado.ip = ip;
  if (typeof rssi === "number") this.estado.rssi = rssi;
  if (fw) this.estado.fw = fw;
  await this.save();
};

// (opcional) expón verificación si el broker o un servicio la usa
dispositivoSchema.methods.verifyDevicePassword = function (plain) {
  const stored = this.provision?.credentials?.passwordHash;
  if (!stored) return false;
  return scryptVerify(plain, stored);
};

// ── consultas helpers ─────────────────────────────────────────────────────────
dispositivoSchema.statics.findByScopedUsername = function (username) {
  return this.findOne({ "provision.credentials.username": username });
};

module.exports = mongoose.model("Dispositivo", dispositivoSchema);
