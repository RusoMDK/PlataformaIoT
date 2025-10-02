// src/socketHandlers/dashboardEvents.js
const jwt = require('jsonwebtoken');
const { emitUnreadCount } = require('../realtime/notify');

/** Sala por usuario (exportada para reutilizarla en otros módulos) */
function roomForUser(userId) {
  return `user:${userId}`;
}

/**
 * Mantiene TU flujo:
 *  - Cliente conecta a /dashboard
 *  - Luego emite: socket.emit('auth', { token: '<JWT>' })
 *  - Lo metemos a la sala del usuario y mandamos el conteo inicial de notificaciones
 *  - Esta misma sala se usará para emitir logs en tiempo real (evento: 'logs:new')
 */
function initDashboardSocketHandlers(dashNs) {
  if (!dashNs) return;

  dashNs.on('connection', (socket) => {
    socket.on('auth', async (data = {}) => {
      try {
        const token = data.token;
        if (!token) {
          socket.emit('auth:error', { msg: 'Token requerido' });
          socket.disconnect(true);
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded?.id;
        if (!userId) throw new Error('JWT sin id');

        socket.data.userId = userId;

        // Une el socket a la sala del usuario
        const room = roomForUser(userId);
        socket.join(room);

        socket.emit('auth:ok', { userId });

        // (Opcional) envía el conteo inicial de no leídas
        try { await emitUnreadCount(userId); } catch {}

        // Listeners opcionales para depurar
        socket.on('ping', () => socket.emit('pong'));
      } catch (e) {
        socket.emit('auth:error', { msg: 'Token inválido/expirado' });
        socket.disconnect(true);
      }
    });

    socket.on('disconnect', () => {
      // cleanup opcional
    });
  });
}

module.exports = { initDashboardSocketHandlers, roomForUser };
