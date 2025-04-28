// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      // Proxy para todas las llamadas REST REST
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      // Proxy para WebSocket de socket.io
      '/socket.io': {
        target: 'ws://localhost:4000',
        ws: true,
        changeOrigin: true,
      },
      // Proxy a tu endpoint de dispositivo conectado (Electron)
      '/dispositivo-conectado': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    },
  },
})