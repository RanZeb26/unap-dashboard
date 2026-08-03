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
        unap: {
          brand: "#54c1c6", // Your exact header teal
          brandhowver: "#197579", // Your exact header teal
          gold: "#c19050",  // Your exact text gold
        },
      },
    },
  },
  plugins: [],
};
export default config;
