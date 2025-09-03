import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // accessible depuis l’extérieur
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'frontend',
      'carte-fede-test.magellan.fpms.ac.be'
    ],
    hmr: {
      host: 'carte-fede-test.magellan.fpms.ac.be',
      protocol: 'ws', // ⚠️ HTTP => ws
      clientPort: 80  // ⚠️ puisque ton Nginx écoute sur 80
    }
  }
});
