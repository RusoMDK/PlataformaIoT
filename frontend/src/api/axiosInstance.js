// src/api/axiosInstance.js
import axios from 'axios';
import { toast } from 'sonner';

const API_ROOT = (import.meta.env.VITE_API_URL || 'https://localhost:4443').replace(/\/$/, '');

const axiosInstance = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
  timeout: 15000,
  xsrfCookieName: 'XSRF-TOKEN',  // 👈 coincide con backend
  xsrfHeaderName: 'X-CSRF-Token' // 👈 mayúsculas, más compatible con proxies
});

// ➜ Request: Authorization global + excepción para verify-otp-login (temp_token)
axiosInstance.interceptors.request.use((config) => {
  const path = config.url || '';
  // prioridad al temp_token SOLO en verify-otp-login
  if (path.includes('verify-otp-login')) {
    const temp = localStorage.getItem('temp_token');
    if (temp) config.headers.Authorization = `Bearer ${temp}`;
    return config;
  }
  // resto: token normal si existe
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ➜ Response: toast de error uniforme
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const msg =
      data?.msg ||
      data?.error ||
      data?.message ||
      err.message ||
      'Error de red. Inténtalo de nuevo.';
    toast.error(msg);
    return Promise.reject(err);
  }
);

export default axiosInstance;
