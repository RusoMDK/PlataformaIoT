// src/lib/delay.js
export function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
