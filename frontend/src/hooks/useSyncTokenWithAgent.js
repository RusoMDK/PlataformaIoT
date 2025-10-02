// src/hooks/useSyncTokenWithAgent.js
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function useSyncTokenWithAgent() {
  const lastTokenRef = useRef(null);
  const backoffRef = useRef(0);           // contador para backoff exponencial
  const timerRef = useRef(null);          // id del setTimeout actual
  const abortRef = useRef(null);          // AbortController del fetch en curso
  const notifiedDownRef = useRef(false);  // ya avisamos que estaba caído

  useEffect(() => {
    // Usa tus envs si existen; si no, fallbacks razonables
    const API   = (import.meta.env.VITE_API_URL   || 'http://localhost:4000').replace(/\/$/, '');
    const AGENT = (import.meta.env.VITE_AGENT_URL || 'http://localhost:3001').replace(/\/$/, '');

    const BASE_INTERVAL = Number(import.meta.env.VITE_AGENT_SYNC_INTERVAL_MS || 7000);
    const MAX_BACKOFF   = 30000; // 30s tope

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleNext = (ms) => {
      clearTimer();
      timerRef.current = setTimeout(run, ms);
    };

    const run = async () => {
      // Si la pestaña está oculta, no hagas trabajo; reintenta luego
      if (typeof document !== 'undefined' && document.hidden) {
        scheduleNext(BASE_INTERVAL);
        return;
      }

      // Cancela cualquier fetch previo y crea uno nuevo
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        // 1) Obtener JWT desde tu backend (cookie httpOnly)
        const tokenRes = await fetch(`${API}/api/auth/jwt-token`, {
          credentials: 'include',
          signal: abortRef.current.signal,
        });
        if (!tokenRes.ok) { scheduleNext(BASE_INTERVAL); return; }

        const { token } = await tokenRes.json();
        if (!token) { scheduleNext(BASE_INTERVAL); return; }

        // 2) Si el token no cambió, no golpees al agente inútilmente
        if (lastTokenRef.current === token) { scheduleNext(BASE_INTERVAL); return; }

        // 3) (Opcional) CSRF best-effort; si falla, seguimos sin él
        let csrfToken = null;
        try {
          const csrfRes = await fetch(`${API}/api/csrf/csrf-token`, {
            credentials: 'include',
            signal: abortRef.current.signal,
          });
          if (csrfRes.ok) {
            const j = await csrfRes.json();
            csrfToken = j?.csrfToken ?? null;
          }
        } catch {
          // silencioso
        }

        // 4) Enviar token al agente
        const sendRes = await fetch(`${AGENT}/api/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
          },
          body: JSON.stringify({ token }),
          signal: abortRef.current.signal,
        });
        if (!sendRes.ok) throw new Error(`Agent HTTP ${sendRes.status}`);

        // 5) (Opcional) pedir reconexión del agente; si falla, no molestamos
        try {
          await fetch(`${AGENT}/api/trigger-reconexion`, {
            method: 'POST',
            signal: abortRef.current.signal,
          });
        } catch {}

        // 6) Éxito ⇒ resetea backoff, guarda token y avisa una sola vez si estaba caído
        const estabaCaido = notifiedDownRef.current;
        lastTokenRef.current = token;
        backoffRef.current = 0;
        if (estabaCaido) {
          toast.success('✅ Agente conectado y token sincronizado.');
          notifiedDownRef.current = false;
        }

        scheduleNext(BASE_INTERVAL);
      } catch (err) {
        // Falla de red o del agente ⇒ backoff exponencial con jitter
        const step = backoffRef.current;
        const delay = Math.min(MAX_BACKOFF, BASE_INTERVAL * (2 ** step)) + Math.floor(Math.random() * 400);
        backoffRef.current = Math.min(step + 1, 6);

        if (!notifiedDownRef.current) {
          console.warn('⚠️ Agente no disponible. Reintento automático en segundo plano.');
          // Mensaje neutro una sola vez; no saturamos con error
          toast.message('⚠️ Conectando con el agente… reintentando en segundo plano.');
          notifiedDownRef.current = true;
        }
        scheduleNext(delay);
      }
    };

    // Reintenta inmediato al volver a estar online
    const onOnline = () => {
      backoffRef.current = 0;
      run();
    };

    run();
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('online', onOnline);
      abortRef.current?.abort();
      clearTimer();
    };
  }, []);
}
