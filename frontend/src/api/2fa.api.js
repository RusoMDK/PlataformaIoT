// src/api/2fa.api.js
import axiosInstance from './axiosInstance';
import { getCsrfToken } from './auth.api';

export async function generar2FA() {
  const csrfToken = await getCsrfToken();
  const res = await axiosInstance.post(
    '/auth2fa/generate-2fa',
    {},
    {
      headers: { 'x-csrf-token': csrfToken },
      withCredentials: true,
    }
  );
  return res.data;
}

export async function activar2FA(otp) {
  const csrfToken = await getCsrfToken();
  const res = await axiosInstance.post(
    '/auth2fa/verify-2fa',
    { otp }, // 👈🏼 ENVIAMOS CORRECTAMENTE "otp" (no token, no secret)
    {
      headers: { 'x-csrf-token': csrfToken },
      withCredentials: true,
    }
  );
  return res.data;
}

export async function desactivar2FA() {
  const csrfToken = await getCsrfToken();
  const res = await axiosInstance.post(
    '/auth2fa/disable-2fa',
    {},
    {
      headers: { 'x-csrf-token': csrfToken },
      withCredentials: true,
    }
  );
  return res.data;
}

export async function reset2FA() {
    const csrfToken = await getCsrfToken();
    const res = await axiosInstance.post(
      '/auth2fa/reset-2fa',
      {},
      {
        headers: { 'x-csrf-token': csrfToken },
        withCredentials: true,
      }
    );
    return res.data;
  }

  export async function verifyOTPLogin(otp) {
    const csrfToken = await getCsrfToken();
    const tempToken = localStorage.getItem('temp_token'); // 👈 agrega este temporal
    const res = await axiosInstance.post(
      '/auth/verify-otp-login',
      { otp },
      {
        headers: {
          'x-csrf-token': csrfToken,
          'Authorization': `Bearer ${tempToken}`, // 🔥 manda el temp token
        },
        withCredentials: true,
      }
    );
    return res.data;
  }