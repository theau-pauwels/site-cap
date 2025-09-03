import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // 👈 Permet l'accès depuis l'extérieur de la VM
    port: 3000,
    strictPort: true,
    allowedHosts: ['frontend', 'localhost', '127.0.0.1', 'carte-fede-test.magellan.fpms.ac.be'],
    hmr: {
      host: 'carte-fede-test.magellan.fpms.ac.be' // 👈 Synchronisation avec l'hôte externe
    }
  }
});
