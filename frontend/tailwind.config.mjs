/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

// const defaultTheme = require("tailwindcss/defaultTheme");
// const plugin = require("tailwindcss/plugin");

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
      screens: {
        xs: "420px",
      },
      boxShadow: {
        // Box shadow generated with https://shadows.brumm.af/
        box: [
          "0 0.6px 2.2px rgba(0, 0, 0, 0.017)",
          "0 1.3px 5.3px rgba(0, 0, 0, 0.024)",
          "0 2.5px 10px rgba(0, 0, 0, 0.03)",
          "0 4.5px 17.9px rgba(0, 0, 0, 0.036)",
          "0 8.4px 33.4px rgba(0, 0, 0, 0.043)",
          "0 20px 80px rgba(0, 0, 0, 0.06)",
        ],
      },
      dropShadow: {
        // Drop shadow white pour le
        // "Fédération des Étudiants"
        // de la page d'accueil
        white: ["0 1px 4px white", "0 0px 5px white"],
        // Drop shadow pour le titre des liens dans <Grid />
        normal: [
          "0 1px 2px rgb(0 0 0 / 1)",
          "0 1px 8px rgb(0 0 0 / 0.8)",
          "0 0px 12px rgb(0 0 0 / 0.5)",
        ],
      },
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        DEFAULT: "0 2px 4px var(--tw-shadow-color)",
        lg: "0 4px 16px var(--tw-shadow-color)",
        none: "none",
        title: [
          "0 1px 4px var(--tw-shadow-color), 0 4px 16px var(--tw-shadow-color)",
        ],
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") },
      );
    }),
  ],
};