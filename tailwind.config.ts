import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alineado con la identidad de soterhseq.com: rojo primario (#F42626),
        // navy/índigo de fondo (#171144 / #21195A) y amarillo de acento (#FFC400).
        brand: {
          50:  "#fef2f2",
          100: "#fde2e1",
          200: "#fbc8c7",
          300: "#f7a19f",
          400: "#f66f68",
          500: "#f54742",
          600: "#f42626",
          700: "#dd1e1e",
          800: "#b91818",
          900: "#8f1414",
          950: "#4a0a0a",
        },
        navy: {
          800: "#21195a",
          900: "#171144",
          950: "#0d0a2a",
        },
        accent: {
          50:  "#fffbeb",
          100: "#fff3c4",
          200: "#ffe680",
          300: "#ffd93d",
          400: "#ffcf14",
          500: "#ffc400",
          600: "#e0ac00",
          700: "#b98700",
          800: "#8f6900",
          900: "#6b4f00",
        },
        safety: {
          green:  "#16a34a",
          orange: "#ea580c",
          yellow: "#ca8a04",
          red:    "#dc2626",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
