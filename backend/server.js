require('dotenv').config();
const express = require('express');
const mongoose = require('./src/config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const os = require('os');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { Server } = require('socket.io');
const { initMQTTListener } = require('./src/mqtt/mqttClient');


const csrfProtection = require('./src/middlewares/csrfProtection'); // 👈 CSRF

// 1) Leer certificados
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs/agente.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/agente.crt')),
};

// 2) Crear app y servidor HTTPS
const app = express();
const server = https.createServer(sslOptions, app);

// 3) Inicializar Socket.IO sobre HTTPS
const io = new Server(server, { cors: { origin: '*' } });
const agentNs = io.of('/agent');
const dashNs = io.of('/dashboard');

const { initDeviceSocketHandlers } = require('./src/socketHandlers/deviceEvents');
initDeviceSocketHandlers(agentNs, dashNs);

// 4) Middlewares
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://localhost:5173',
    'https://localhost:3001',
    'file://',
  ],
  credentials: true,
}));

// Asegurar carpeta tmp
const tmpPath = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);


app.use(express.json());
app.use(cookieParser());

// Rutas sin CSRF
app.use('/api/csrf',                                 require('./src/routes/csrf.routes'));
app.use('/api/auth',                                 require('./src/routes/loginSinCsrf.route'));
app.use('/api/sketch',                               require('./src/routes/sketchManual.route'));


// Rutas protegidas con CSRF
app.use('/api/auth',                csrfProtection,  require('./src/routes/auth.routes'));
app.use('/api/proyectos',           csrfProtection,  require('./src/routes/proyecto.routes'));
app.use('/api/sensores',            csrfProtection,  require('./src/routes/sensor.routes'));
app.use('/api/lecturas',            csrfProtection,  require('./src/routes/lectura.routes'));
app.use('/api/admin',               csrfProtection,  require('./src/routes/admin.routes'));
app.use('/api/auth2fa',             csrfProtection,  require('./src/routes/auth2fa.routes'));
app.use('/api/exportar',            csrfProtection,  require('./src/routes/export.routes'));
app.use('/api/alertas',             csrfProtection,  require('./src/routes/alerta.routes'));
app.use('/api/alertas/historial',   csrfProtection,  require('./src/routes/alertaHistorial.routes'));
app.use('/api/notificaciones',      csrfProtection,  require('./src/routes/notificacion.routes'));
app.use('/api/logs',                csrfProtection,  require('./src/routes/log.routes'));
app.use('/api/visualizaciones',     csrfProtection,  require('./src/routes/visualizacion.routes'));
app.use('/api/dispositivos',        csrfProtection,  require('./src/routes/dispositivo.routes'));
app.use('/api/ia',                  csrfProtection,  require('./src/routes/ia.routes'));
app.use('/api/sensores-biblioteca', csrfProtection,  require('./src/routes/sensorBiblioteca.routes'));
app.use('/api/agentes',             csrfProtection,  require('./src/routes/agentes.routes'));
app.use('/api/usuarios',            csrfProtection,  require('./src/routes/usuarios.routes'));

// Swagger
app.use('/api/docs', require('./swagger').swaggerUi.serve, require('./swagger').swaggerUi.setup(require('./swagger').swaggerDocs));

// 5) Conexión a MongoDB y arrancar
const PORT = process.env.PORT || 4443;
mongoose.connection.once('open', () => {
  initMQTTListener();
  const ip = 'localhost';
  server.listen(PORT, () => {
    console.log(`🚀 Servidor HTTPS corriendo en https://${ip}:${PORT}`);
  });
});

