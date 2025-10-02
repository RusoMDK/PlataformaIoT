// src/context/NotificacionesContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import axiosInstance from '@/api/axiosInstance';
import useNotifsRT from '@/hooks/useNotifsRT';

const NotificacionesContext = createContext();
export const useNotificaciones = () => useContext(NotificacionesContext);

export const NotificacionesProvider = ({ children }) => {
  const [noLeidas, setNoLeidas] = useState(0);

  // Poll (ms) – 0 = sin polling
  const POLL_MS = useMemo(
    () => Number(import.meta.env.VITE_NOTIFS_POLL_MS || 0),
    []
  );

  const inflightRef = useRef(false);
  const timerRef = useRef(null);

  const obtenerConteo = useCallback(async ({ silent = true } = {}) => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    try {
      const { data } = await axiosInstance.get('/notificaciones/unread-count');
      const count = Number(data?.count ?? 0);
      setNoLeidas(Number.isFinite(count) ? count : 0);
      return count;
    } catch (err) {
      if (!silent) console.warn('❌ unread-count error:', err?.message || err);
      // Mantener último valor en error para evitar parpadeo
      return noLeidas;
    } finally {
      inflightRef.current = false;
    }
  }, [noLeidas]);

  useEffect(() => {
    // primer fetch
    obtenerConteo({ silent: true });

    // polling opcional
    if (POLL_MS > 0) {
      const tick = async () => {
        await obtenerConteo({ silent: true });
        timerRef.current = setTimeout(tick, POLL_MS);
      };
      timerRef.current = setTimeout(tick, POLL_MS);
    }

    // refresca al volver a primer plano
    const onVisible = () => { if (!document.hidden) obtenerConteo({ silent: true }); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [POLL_MS, obtenerConteo]);

 // ► Tiempo real: actualiza el badge cuando llegue notifs:unread-count
  useNotifsRT({
    onUnread: (count) => {
      if (Number.isFinite(count)) setNoLeidas(count);
    },
  });

  const value = useMemo(() => ({
    noLeidas,
    setNoLeidas,
    obtenerConteo, // úsalo después de marcar como leída(s)
  }), [noLeidas, obtenerConteo]);

  return (
    <NotificacionesContext.Provider value={value}>
      {children}
    </NotificacionesContext.Provider>
  );
};
