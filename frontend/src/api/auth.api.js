import axiosInstance from './axiosInstance';

// 🔥 Pedir el CSRF Token (¡ahora sí correcto!)
export const getCsrfToken = async () => {
  const { data } = await axiosInstance.get('/csrf/csrf-token', {
    withCredentials: true,
  });
  return data.csrfToken;
};

// 🔐 Login
export const login = async (email, password) => {
  const csrfToken = await getCsrfToken();
  const { data } = await axiosInstance.post(
    '/auth/login',
    { email, password },
    {
      headers: { 'x-csrf-token': csrfToken },
      withCredentials: true,
    }
  );
  return data.usuario;
};

// logout real
export const logout = async () => {
  const csrfToken = await getCsrfToken();
  await axiosInstance.post(
    '/auth/logout',
    {},
    {
      headers:      { 'x-csrf-token': csrfToken },
      withCredentials: true,
    }
  );
};

// Obtener perfil de auth (si lo necesitas)
export const fetchUserProfile = async () => {
  const { data } = await axiosInstance.get('/auth/perfil', {
    withCredentials: true,
  });
  return data.usuario;
};