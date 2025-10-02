// src/lib/socketDashboard.js
import { io } from 'socket.io-client';

const WS = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'https://localhost:4443';

let dashboardSocket = null;

export function getDashboardSocket() {
  if (dashboardSocket) return dashboardSocket;
  dashboardSocket = io(`${WS}/dashboard`, {
    transports: ['websocket'],
    withCredentials: true,
  });
  return dashboardSocket;
}
