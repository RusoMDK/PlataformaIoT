// src/api/deviceActions.api.js
import axiosInstance from '@/api/axiosInstance';
import { getCsrfToken } from '@/api/auth.api';

const BASE = '/devices'; // ajusta si tu backend usa otro prefijo

export async function setDesired(deviceId, desired, clientToken) {
  const csrf = await getCsrfToken();
  return axiosInstance.post(
    `${BASE}/${deviceId}/desired`,
    { desired, clientToken },
    { headers: { 'x-csrf-token': csrf }, withCredentials: true }
  );
}

// Alias por compatibilidad con otros widgets
export async function sendDesired(deviceId, desired, clientToken) {
  return setDesired(deviceId, desired, clientToken);
}

export async function sendCommand(deviceId, command, payload = {}, clientToken) {
  const csrf = await getCsrfToken();
  return axiosInstance.post(
    `${BASE}/${deviceId}/commands`,
    { command, payload, clientToken },
    { headers: { 'x-csrf-token': csrf }, withCredentials: true }
  );
}
