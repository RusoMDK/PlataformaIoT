// hooks/useDispositivo.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export function useDispositivo(uid) {
  const [dispositivo, setDispositivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) return;

    const fetchDispositivo = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`http://localhost:4000/api/dispositivos/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
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

  return { dispositivo, loading, error };
}