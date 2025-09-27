import { useEffect, useRef } from 'react';
import { toast } from 'sonner'; // 👈 Asegúrate de tener esto instalado

export default function useSyncTokenWithAgent() {
  const lastTokenRef = useRef(null);

  useEffect(() => {
    const intervalo = setInterval(async () => {
      try {
        // 1. Obtener el token desde el backend
        const tokenRes = await fetch('https://localhost:4443/api/auth/jwt-token', {
          credentials: 'include',
        });
        if (!tokenRes.ok) throw new Error('Usuario no autenticado');

        const { token } = await tokenRes.json();

        // 2. Si el token no ha cambiado, no hacemos nada
        if (lastTokenRef.current === token) return;

        lastTokenRef.current = token;

        // 3. Obtener CSRF
        const csrfRes = await fetch('https://localhost:4443/api/csrf/csrf-token', {
          credentials: 'include',
        });
        const { csrfToken } = await csrfRes.json();

        // 4. Enviar token al agente
        const sendTokenRes = await fetch('http://localhost:3001/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          body: JSON.stringify({ token }),
        });

        if (!sendTokenRes.ok) {
          toast.error('❌ El agente no pudo recibir el token');
          return;
        }

        // 5. Notificar al agente que reconecte
        const reconectarRes = await fetch('http://localhost:3001/api/trigger-reconexion', {
          method: 'POST',
        });

        if (!reconectarRes.ok) {
          toast.error('❌ Falló la reconexión del agente');
          return;
        }

        toast.success('🔄 Token sincronizado con el agente');
      } catch (err) {
        console.warn('⚠️ Error sincronizando token con agente:', err.message);
        if (err.message !== 'Usuario no autenticado') {
          toast.error(`⚠️ Error al sincronizar con el agente: ${err.message}`);
        }
      }
    }, 7000); // cada 7 segundos

    return () => clearInterval(intervalo);
  }, []);
}
