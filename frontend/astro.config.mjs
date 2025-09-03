import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
<<<<<<< HEAD
  redirects: {
    "/cercles": "/cercles&commissions",
    "/houzeau": "/cite-houzeau",
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    robotsTxt(),
  ],
  site: "https://carte.fede.fpms.ac.be",
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
    resolve: {
      alias: {
        "@components": "/src/components",
        "@layouts": "/src/layouts",
        "@images": "/src/assets/images",
        "@assets": "/src/assets",
        "@styles": "/src/styles",
        "@icons": "/src/icons",
      },
    },
  },
=======
  site: 'https://carte-fede-test.magellan.fpms.ac.be', // ← important pour URLs absolues
>>>>>>> 11347e567bded2b649e61579e5c08fb50db60f12
});
