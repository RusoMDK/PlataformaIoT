// src/hooks/useNotifsRT.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useNotifsRT({ onNew, onUnread } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const BASE = (import.meta.env.VITE_API_URL || 'https://localhost:4443').replace(/\/$/, '');
    const URL = `${BASE}/dashboard`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    // evita duplicados
    if (socketRef.current) return;

    const s = io(URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true, // CORS ok en tu server
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      timeout: 10000,
    });

    socketRef.current = s;

    s.on('connect', () => {
      // auth explícito (tu backend lo espera)
      s.emit('auth', { token });
    });

    s.on('auth:ok', () => {
      // listo: el backend puede emitir notifs inmediatamente
    });

    s.on('auth:error', () => {
      // token inválido/expirado: cerramos
      try { s.disconnect(); } catch {}
    });

    // eventos de negocio
    s.on('notifs:new', (notif) => {
      if (typeof onNew === 'function') onNew(notif);
    });

    s.on('notifs:unread-count', (payload) => {
      const count = Number(payload?.count ?? payload?.unread ?? 0);
      if (typeof onUnread === 'function') onUnread(count);
    });

    return () => {
      try { s.removeAllListeners(); s.disconnect(); } catch {}
      socketRef.current = null;
    };
  }, [onNew, onUnread]);
}
