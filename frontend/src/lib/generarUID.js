// src/lib/generarUID.js
export function generarUID() {
  return Math.random().toString(36).substring(2, 10);
}
