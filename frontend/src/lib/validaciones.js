// src/lib/validaciones.js
export function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function tieneLongitudMinima(texto, min = 3) {
  return texto.trim().length >= min;
}

export function camposRequeridos(objeto, campos) {
  return campos.every(campo => objeto[campo]?.toString().trim());
}
