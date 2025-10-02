// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './certs/agente.key')),
      cert: fs.readFileSync(path.resolve(__dirname, './certs/agente.crt')),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:4443',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://localhost:4443',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/dispositivo-conectado': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@router': fileURLToPath(new URL('./src/router', import.meta.url)),
    },
  },
});
