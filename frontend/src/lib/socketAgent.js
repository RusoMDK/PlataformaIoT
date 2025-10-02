// src/utils/socket.js
import { io } from 'socket.io-client';

// Conéctate al agente local (mismo puerto de tu API de agente, ej. 3001)
const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnectionAttempts: 3,
});

export default socket;
