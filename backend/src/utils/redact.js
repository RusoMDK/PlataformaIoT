// src/utils/redact.js
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const IP_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g; // IPv4 simple
const SENSITIVE_KEYS = ['password','passwd','secret','token','access_token','refresh_token','authorization','apiKey','apikey','x-api-key','key'];

function maskEmail(email) {
  if (!email) return email;
  const [user, domain] = String(email).split('@');
  if (!domain) return email;
  const u = user.length <= 2 ? user[0] + '*' : user[0] + '*'.repeat(Math.max(user.length-2,1)) + user.slice(-1);
  const d = domain.split('.');
  const dom = d[0]?.slice(0,2) + '***.' + d.slice(1).join('.');
  return `${u}@${dom}`;
}

function maskIP(ip) {
  if (!ip) return ip;
  const parts = ip.split('.');
  if (parts.length !== 4) return ip;
  return `${parts[0]}.${parts[1]}.*.*`;
}

function redactPII(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(EMAIL_RE, (m) => maskEmail(m))
    .replace(IP_RE,    (m) => maskIP(m));
}

function scrubObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(scrubObject);

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const kl = k.toLowerCase();
    if (SENSITIVE_KEYS.includes(kl)) {
      out[k] = '[redacted]';
      continue;
    }
    out[k] = typeof v === 'object' ? scrubObject(v) : redactPII(v);
  }
  return out;
}

/**
 * Para usuarios NO admin: deja campos mínimos y detail solo si es seguro/public.
 * Para admin: conserva más campos pero sin secretos.
 */
function sanitizeLogForUser(doc, { isAdmin = false } = {}) {
  const base = {
    _id: doc._id,
    ts: doc.ts || doc.fecha || doc.createdAt,
    level: (doc.level || doc.nivel || 'info').toLowerCase(),
    module: doc.module || doc.modulo || '',
    action: doc.action || doc.accion || '',
    message: doc.message || doc.mensaje || '',
  };

  // No exponemos el ObjectId del usuario a usuarios normales
  if (isAdmin) base.usuario = doc.usuario;

  // Sensibilidad (si no tienes el campo, aplicamos política conservadora)
  const sensitivity = (doc.sensitivity || doc.visibility || 'owner').toLowerCase();
  const isPublic = sensitivity === 'public' || sensitivity === 'owner';

  const detail = doc.detail ?? doc.detalle ?? null;

  if (detail != null) {
    if (isAdmin) {
      // Admin ve el detail pero scrub de secretos/PII
      base.detail = typeof detail === 'string' ? redactPII(detail) : scrubObject(detail);
    } else if (isPublic) {
      // Usuario solo si es público/owner y además redactado
      base.detail = typeof detail === 'string' ? redactPII(detail) : scrubObject(detail);
    } else {
      // Si es sensible, no lo enviamos al usuario
      // base.detail = undefined;
    }
  }

  return base;
}

module.exports = {
  maskEmail,
  maskIP,
  redactPII,
  scrubObject,
  sanitizeLogForUser,
};
