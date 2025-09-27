import axiosInstance from './axiosInstance';

// ✅ Leer el token directamente desde la cookie que csurf expone para el frontend
export const getCsrfToken = async () => {
  const res = await axiosInstance.get('/csrf/csrf-token', {
    withCredentials: true,
  });

  // Lee el XSRF-TOKEN desde cookie (lo que el frontend puede acceder)
  const csrfFromCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  return csrfFromCookie || res.data.csrfToken;
};



// ✅ Login: recibe el token como argumento
export const login = async (email, password, csrfToken) => {
  const { data } = await axiosInstance.post(
    '/auth/login',
    { email, password },
    {
      headers: { 'x-csrf-token': csrfToken },
      withCredentials: true,
    }
  );

  return data;
};

// ✅ Logout con CSRF también
export const logout = async () => {
  const csrfToken = await getCsrfToken();
  await axiosInstance.post(
    '/auth/logout',
    {},
    {
      headers: { 'x-csrf-token': csrfToken },
      withCredentials: true,
    }
  );
};

// ✅ Perfil autenticado
export const fetchUserProfile = async () => {
  const { data } = await axiosInstance.get('/auth/perfil', {
    withCredentials: true,
  });
  return data.usuario;
};
