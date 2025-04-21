import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'; // <-- importa el plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()], // <-- agrégalo aquí
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
})

