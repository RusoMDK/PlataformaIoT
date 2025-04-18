import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

/* ➜ inyecta token en cada request */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ➜ toast en cada respuesta OK opcional */
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.msg || err.message || 'Error de red. Inténtalo de nuevo.';

    toast.error(msg);
    return Promise.reject(err);
  }
);

export default api;
