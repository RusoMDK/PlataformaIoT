require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db');
const cors = require('cors');
const os = require('os');

// Rutas
const authRoutes = require('./routes/auth.routes');
const proyectoRoutes = require('./routes/proyecto.routes');
const sensorRoutes = require('./routes/sensor.routes');
const lecturaRoutes = require('./routes/lectura.routes');
const adminRoutes = require('./routes/admin.routes');
const exportRoutes = require('./routes/export.routes');
const alertaRoutes = require('./routes/alerta.routes');
const alertaHistorialRoutes = require('./routes/alertaHistorial.routes');
const notificacionRoutes = require('./routes/notificacion.routes');
const { swaggerUi, swaggerDocs } = require('./swagger');
const logRoutes = require('./routes/log.routes');
const visualizacionRoutes = require('./routes/visualizacion.routes');
const dispositivoRoutes = require('./routes/dispositivo.routes');
const sensorBibliotecaRoutes = require("./routes/sensorBiblioteca.routes");


const app = express();
app.use(cors());
app.use(express.json());

// Endpoints base
app.use('/api/auth', authRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/sensores', sensorRoutes);
app.use('/api/lecturas', lecturaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exportar', exportRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/alertas/historial', alertaHistorialRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/logs', logRoutes);
app.use('/api/visualizaciones', visualizacionRoutes);
app.use("/api/dispositivos", dispositivoRoutes);
app.use("/api/sensores-biblioteca", sensorBibliotecaRoutes);



// 🔍 Obtener IP local para mostrar en consola
function getIPLocal() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  const ipLocal = getIPLocal();
  console.log(`🚀 Servidor corriendo en http://${ipLocal}:${PORT}`);
});