// src/lib/formatearFecha.js
export function formatearFecha(fecha) {
  const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-ES', opciones);
}
