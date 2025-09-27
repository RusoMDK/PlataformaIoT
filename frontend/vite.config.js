// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


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
});
