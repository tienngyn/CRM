import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          soft: "rgb(var(--accent) / 0.1)",
        },
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse at top, rgb(var(--accent) / 0.15), transparent 60%)",
        "card-gradient":
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
      },
      boxShadow: {
        "glow-red": "0 0 40px -8px rgb(var(--accent) / 0.4)",
        "card": "0 1rem 2rem -1rem rgba(0,0,0,0.8)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
