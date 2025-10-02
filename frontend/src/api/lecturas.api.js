import axiosInstance from './axiosInstance';
import { getCsrfToken } from './auth.api';

/**
 * Ejemplo de params:
 * { sensorId, from, to, bucket: '5m' }
 * - sensorId: string (obligatorio por ahora)
 * - from/to: ISO o epoch ms. Si no pasas, backend puede mandar último rango por defecto
 * - bucket: '1m' | '5m' | '15m' | '1h' ...
 */
export async function getLecturasOptimizado(params) {
  const csrfToken = await getCsrfToken();
  const { data } = await axiosInstance.get('/lecturas/optimizado', {
    params,
    headers: { 'x-csrf-token': csrfToken },
    withCredentials: true,
  });
  return data || [];
}
