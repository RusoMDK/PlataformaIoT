import { useEffect, useState } from 'react';
import api from '@/utils/axios';

export default function useSensoresBiblioteca() {
  const [sensores, setSensores] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchSensores = async () => {
      try {
        const { data } = await api.get('/sensores-biblioteca');
        setSensores(data || []);
      } catch (err) {
        console.error('❌ Error al obtener sensores de biblioteca:', err);
      } finally {
        setCargando(false);
      }
    };

    fetchSensores();
  }, []);

  return { sensores, cargando };
}
