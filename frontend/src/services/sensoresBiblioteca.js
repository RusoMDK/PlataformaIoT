// src/services/sensoresBiblioteca.js
import axiosInstance from '@/api/axiosInstance';

export const obtenerBibliotecaSensores = async () => {
  const { data } = await axiosInstance.get('/sensores-biblioteca');
  return data; // asume que devuelve un array de sensores
};
