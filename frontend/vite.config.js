// frontend/vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,             // écoute sur 0.0.0.0 en Docker
    port: 3000,             // ou 4321 si vous l’utilisez
    strictPort: true,
    allowedHosts: ['frontend', 'localhost', '127.0.0.1'],
    hmr: { host: 'localhost' } // utile derrière proxy pour le HMR
  }
});
