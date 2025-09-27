// hooks/useDispositivo.js
import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { getCsrfToken } from '../api/auth.api';

export function useDispositivo(uid) {
  const [dispositivo, setDispositivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return;

    const fetchDispositivo = async () => {
      try {
        setLoading(true);
        const csrfToken = await getCsrfToken();
        const { data } = await axiosInstance.get(`/dispositivos/${uid}`, {
          headers: {
            'x-csrf-token': csrfToken,
          },
          withCredentials: true,
        });
        setDispositivo(data);
      } catch (err) {
        console.error('❌ Error cargando dispositivo:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDispositivo();
  }, [uid]);

  const sensores = dispositivo?.sensores || [];

  return { dispositivo, sensores, loading, error };
}
