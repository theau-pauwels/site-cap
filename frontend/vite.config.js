import { defineConfig } from 'vite';
export default defineConfig({
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: ['frontend','localhost','127.0.0.1'],
    hmr: { host: 'localhost' }
  }
});
