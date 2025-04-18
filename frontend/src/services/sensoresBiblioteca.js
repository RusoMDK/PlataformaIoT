// src/services/sensoresBiblioteca.js
import axios from '../utils/axios';

export const obtenerBibliotecaSensores = async () => {
  const { data } = await axios.get('/sensores-biblioteca');
  return data; // asume que devuelve un array de sensores
};
