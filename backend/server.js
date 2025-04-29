// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('./src/config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const os = require('os');
const http = require('http');
const { Server } = require('socket.io');

const csrfProtection = require('./src/middlewares/csrfProtection'); // 👈 Importamos nuestro csrfProtection.js

// 1) Creamos app y servidor HTTP
const app = express();
const server = http.createServer(app);

// 2) Inicializamos Socket.IO con CORS abierto
const io = new Server(server, { cors: { origin: '*' } }); // 🔥 Socket no lo tocamos
const agentNs = io.of('/agent');
const dashNs = io.of('/dashboard');

// 3) Inyectamos nuestros manejadores de WebSocket
const { initDeviceSocketHandlers } = require('./src/socketHandlers/deviceEvents');
initDeviceSocketHandlers(agentNs, dashNs);

// 4) Middlewares HTTP

// ⚡ Configuramos CORS correctamente para cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// 👇 Rutas abiertas sin csrfProtection
app.use('/api/csrf',                                 require('./src/routes/csrf.routes'));

// 🔥 A partir de aquí: rutas protegidas (con CSRF activo)
app.use('/api/auth', csrfProtection,                 require('./src/routes/auth.routes'));
app.use('/api/proyectos', csrfProtection,            require('./src/routes/proyecto.routes'));
app.use('/api/sensores', csrfProtection,             require('./src/routes/sensor.routes'));
app.use('/api/lecturas', csrfProtection,             require('./src/routes/lectura.routes'));
app.use('/api/admin', csrfProtection,                require('./src/routes/admin.routes'));
app.use('/api/auth2fa', csrfProtection,              require('./src/routes/auth2fa.routes'));
app.use('/api/exportar', csrfProtection,             require('./src/routes/export.routes'));
app.use('/api/alertas', csrfProtection,              require('./src/routes/alerta.routes'));
app.use('/api/alertas/historial', csrfProtection,    require('./src/routes/alertaHistorial.routes'));
app.use('/api/notificaciones', csrfProtection,       require('./src/routes/notificacion.routes'));
app.use('/api/logs', csrfProtection,                 require('./src/routes/log.routes'));
app.use('/api/visualizaciones', csrfProtection,      require('./src/routes/visualizacion.routes'));
app.use('/api/dispositivos', csrfProtection,         require('./src/routes/dispositivo.routes'));
app.use('/api/sensores-biblioteca', csrfProtection,  require('./src/routes/sensorBiblioteca.routes'));
app.use('/api/agentes', csrfProtection,              require('./src/routes/agentes.routes'));
app.use('/api/usuarios', csrfProtection,             require('./src/routes/usuarios.routes'));

// Swagger (no necesita csrf)
app.use('/api/docs', require('./swagger').swaggerUi.serve, require('./swagger').swaggerUi.setup(require('./swagger').swaggerDocs));

// 5) Función auxiliar para IP local
function getIPLocal() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const iface of nets[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// 6) Conexión a MongoDB y arranque del servidor
const PORT = process.env.PORT || 4000;
mongoose.connection.once('open', () => {
  const ip = getIPLocal();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://${ip}:${PORT}`);
  });
});
mongoose.connection.on('error', err => {
  console.error('❌ Error conectando a MongoDB:', err.message);
});