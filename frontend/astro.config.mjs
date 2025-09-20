import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    robotsTxt(),
  ],
  site: "https://cap.fede.fpms.ac.be",
  output: "static",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  serverOptions: {
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self';",
    },
  },
  vite: {
     server: {
       host: true,
       port: 3000,
       allowedHosts: [
         'frontend',
         'localhost',
         '127.0.0.1',
         '::1',
         'magellan.fpms.ac.be',
       ],
       hmr: {
         protocol: 'ws',
         host: process.env.HMR_HOST || 'localhost',
         port: 80,
         overlay: false,
      },
    },
  },
});
