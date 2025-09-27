import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: 'https://localhost:4443/api', // 👈 ¡Este es el bueno!
  withCredentials: true, // 👈 Necesario para cookies CSRF
});

api.interceptors.request.use(config => {
  const path = config.url;

  // Solo para rutas que usan auth por header (por ejemplo, /verify-otp-login)
  if (path?.includes('verify-otp-login')) {
    const token = localStorage.getItem('temp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

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
