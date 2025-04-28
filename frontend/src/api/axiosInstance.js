// src/api/axiosInstance.js
import axios from 'axios';

const API_ROOT = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000';

export default axios.create({
  // baseURL termina en /api para que todas las rutas sean relativas a /api
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'x-csrf-token',
});