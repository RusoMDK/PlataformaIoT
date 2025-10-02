// backend/server.js
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// DB (devuelve la conexión ya inicializada)
const mongoose = require('./src/config/db');

// Realtime / IoT
const { Server } = require('socket.io');
const { initMQTTListener, getClient } = require('./src/mqtt/mqttClient');
const { setIO } = require('./src/realtime/io');
const { initDashboardSocketHandlers, roomForUser } = require('./src/socketHandlers/dashboardEvents');

// ⬇️ NUEVO: bus de logs (event emitter)
const { onLog, onLogMany } = require('./src/realtime/logs');

// Workers (se ejecutan DESPUÉS de initMQTTListener)
const { startIngestor } = require('./src/workers/ingestor');

// Rutas y middlewares
const csrfProtection = require('./src/middlewares/csrfProtection');

// ------------------------------
// 1) SSL - certificados (HTTPS)
// ------------------------------
const CERTS_DIR = path.join(__dirname, 'certs');
const sslOptions = {
  key: fs.readFileSync(path.join(CERTS_DIR, 'agente.key')),
  cert: fs.readFileSync(path.join(CERTS_DIR, 'agente.crt')),
};

// ------------------------------
// 2) App Express + Server HTTPS
// ------------------------------
const app = express();
const server = https.createServer(sslOptions, app);

// ------------------------------
// 3) Socket.IO (sobre HTTPS)
// ------------------------------
const io = new Server(server, {
  cors: { origin: '*', credentials: true },
});

// Namespaces para aislar tráfico
const agentNs = io.of('/agent');       // conexión con agentes/dispositivos
const dashNs  = io.of('/dashboard');   // eventos en panel/dashboard

// Handlers de sockets por dispositivo (si existen)
try {
  const { initDeviceSocketHandlers } = require('./src/socketHandlers/deviceEvents');
  initDeviceSocketHandlers(agentNs, dashNs);
} catch {
  console.warn('[WARN] Falta ./src/socketHandlers/deviceEvents (lo añadimos luego).');
}

// Registra el io y namespaces para uso global (notify.js, etc.)
setIO(io, { dashNs, agentNs });

// Inicializa auth/salas del dashboard (user:<id>)
initDashboardSocketHandlers(dashNs);

// ------------------------------
// 3.b) 🔔 LOGS en tiempo real → reenviar a sala del usuario
// ------------------------------
(function wireRealtimeLogs() {
  const safe = (log) => (log && typeof log.toObject === 'function' ? log.toObject() : log);

  // un solo log
  onLog(({ userId, log }) => {
    if (!userId || !log) return;
    try {
      dashNs.to(roomForUser(userId)).emit('logs:new', safe(log));
    } catch (e) {
      console.warn('logs:new emit error:', e?.message);
    }
  });

  // varios logs a la vez
  onLogMany(({ userId, logs }) => {
    if (!userId || !Array.isArray(logs) || !logs.length) return;
    try {
      dashNs.to(roomForUser(userId)).emit('logs:many', logs.map(safe));
    } catch (e) {
      console.warn('logs:many emit error:', e?.message);
    }
  });
})();

// ------------------------------
// 4) Middlewares base
// ------------------------------
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://localhost:5173',
    process.env.AGENT_URL    || 'https://localhost:3001',
    'file://',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Asegurar carpeta tmp
const tmpPath = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true });

// ------------------------------
// 5) Rutas (orden importa)
//    - Primero SIN CSRF (login inicial, agentes, sketch, provision)
//    - Luego CON CSRF (resto del panel autenticado)
// ------------------------------

// ===== SIN CSRF =====
app.use('/api/csrf',     require('./src/routes/csrf.routes'));
app.use('/api/auth',     require('./src/routes/loginSinCsrf.route')); // login inicial sin CSRF
app.use('/api/sketch',   require('./src/routes/sketchManual.route')); // descarga/generación de sketch

// Provisionamiento (si existe)
try {
  app.use('/api/provision', require('./src/routes/provision.routes'));
} catch {
  console.warn('[WARN] Falta ./src/routes/provision.routes.js (lo añadimos luego).');
}

// ===== CON CSRF =====
app.use('/api/auth',                csrfProtection, require('./src/routes/auth.routes'));
app.use('/api/proyectos',           csrfProtection, require('./src/routes/proyecto.routes'));
app.use('/api/sensores',            csrfProtection, require('./src/routes/sensor.routes'));
app.use('/api/lecturas',            csrfProtection, require('./src/routes/lectura.routes'));
app.use('/api/admin',               csrfProtection, require('./src/routes/admin.routes'));
app.use('/api/auth2fa',             csrfProtection, require('./src/routes/auth2fa.routes'));
app.use('/api/exportar',            csrfProtection, require('./src/routes/export.routes'));
app.use('/api/alertas',             csrfProtection, require('./src/routes/alerta.routes'));
app.use('/api/alertas/historial',   csrfProtection, require('./src/routes/alertaHistorial.routes'));
app.use('/api/notificaciones',      csrfProtection, require('./src/routes/notificacion.routes'));
app.use('/api/logs',                csrfProtection, require('./src/routes/log.routes'));
app.use('/api/visualizaciones',     csrfProtection, require('./src/routes/visualizacion.routes'));
app.use('/api/dispositivos',        csrfProtection, require('./src/routes/dispositivo.routes'));
app.use('/api/ia',                  csrfProtection, require('./src/routes/ia.routes'));
app.use('/api/sensores-biblioteca', csrfProtection, require('./src/routes/sensorBiblioteca.routes'));
app.use('/api/agentes',             csrfProtection, require('./src/routes/agentes.routes'));
app.use('/api/usuarios',            csrfProtection, require('./src/routes/usuarios.routes'));

// REST → MQTT (desired / commands)
try {
  app.use('/api', csrfProtection, require('./src/routes/deviceDesired.routes'));
  app.use('/api', csrfProtection, require('./src/routes/deviceCommands.routes'));
} catch {
  console.warn('[WARN] Faltan deviceDesired.routes o deviceCommands.routes (los añadimos luego).');
}

// (Opcional) Healthcheck simple
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    mqtt: !!getClient(),
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected',
    time: new Date().toISOString()
  });
});

// ------------------------------
// 6) Swagger (si ya tienes swagger.js)
// ------------------------------
try {
  const { swaggerUi, swaggerDocs } = require('./swagger');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
} catch {
  console.warn('[WARN] Swagger no inicializado (./swagger.js no encontrado).');
}

// ------------------------------
// 7) Arranque: Mongo + MQTT + workers + HTTPS
// ------------------------------
const PORT = Number(process.env.PORT || 4443);

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB conectado.');

  // 7.1) Inicializa MQTT **ANTES** del ingestor (pasando namespaces)
  try {
    initMQTTListener({ io, agentNs, dashNs });
    console.log('✅ MQTT listener inicializado.');
  } catch (e) {
    console.error('❌ Error iniciando MQTT listener:', e.message);
  }

  // 7.2) Arranca el ingestor (el client ya existe)
  try {
    if (typeof startIngestor === 'function') {
      startIngestor({ io, agentNs, dashNs });
      console.log('✅ Ingestor iniciado.');
    }
  } catch (e) {
    console.error('❌ Error iniciando ingestor:', e.message);
  }

  // 7.3) Levantar HTTPS
  const ip = process.env.HOST || 'localhost';
  server.listen(PORT, () => {
    console.log(`🚀 Servidor HTTPS en https://${ip}:${PORT}`);
    console.log(`   NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
});

// ------------------------------
// 8) Señales & errores (graceful shutdown)
// ------------------------------
function shutdown() {
  console.log('🛑 Shutting down...');
  try {
    const c = getClient();
    if (c) c.end(true);
  } catch (e) {
    console.warn('[WARN] error cerrando MQTT:', e?.message);
  }
  server.close(() => {
    mongoose.connection.close(false).finally(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
