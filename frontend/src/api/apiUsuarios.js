import axiosInstance from './axiosInstance';
import { getCsrfToken } from './auth.api';

// Trae el perfil del usuario
export async function getProfile() {
  const csrfToken = await getCsrfToken();
  const { data } = await axiosInstance.get('/usuarios/me', {
    headers: { 'x-csrf-token': csrfToken },
    withCredentials: true,
  });
  return data.usuario;
}

// Guarda TODO (fotoPerfil, bio, redes + datos personales)
export async function updateCuenta(formData) {
  const csrfToken = await getCsrfToken();
  const { data } = await axiosInstance.put(
    '/usuarios/me',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-csrf-token': csrfToken,
      },
      withCredentials: true,
    }
  );
  return data.usuario;
}

// Cambiar contraseña
export async function changePassword(currentPassword, newPassword) {
  const csrfToken = await getCsrfToken();
  const { data } = await axiosInstance.put(
    '/usuarios/me/password',
    { currentPassword, newPassword },
    {
      headers: { 'x-csrf-token': csrfToken },
      withCredentials: true,
    }
  );
  return data.msg;
}

// Eliminar cuenta
export async function deleteAccount() {
  const csrfToken = await getCsrfToken();
  const { data } = await axiosInstance.delete('/usuarios/me', {
    headers: { 'x-csrf-token': csrfToken },
    withCredentials: true,
  });
  return data.msg;
}

// Exportar datos
export async function exportarDatosUsuario() {
  const csrfToken = await getCsrfToken();
  const { data } = await axiosInstance.get(
    '/usuarios/exportar-datos',
    {
      headers: { 'x-csrf-token': csrfToken },
      responseType: 'blob',
      withCredentials: true,
    }
  );
  return data;
}