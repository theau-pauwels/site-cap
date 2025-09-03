import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 3000,          // 👈 on force 3000 pour coller au nginx
    strictPort: true,
    allowedHosts: ['frontend', 'localhost', '127.0.0.1', 'carte-fede-test.magellan.fpms.ac.be'],
    hmr: { host: 'localhost' }
  }
});
