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
        // "white" is used throughout as the foreground/ink colour (text,
        // borders, surface tints). Backing it with a variable lets it flip
        // to near-black on light themes so the whole UI inverts correctly.
        white: "rgb(var(--ink) / <alpha-value>)",
        zinc: {
          100: "rgb(var(--zinc-100) / <alpha-value>)",
          200: "rgb(var(--zinc-200) / <alpha-value>)",
          300: "rgb(var(--zinc-300) / <alpha-value>)",
          400: "rgb(var(--zinc-400) / <alpha-value>)",
          500: "rgb(var(--zinc-500) / <alpha-value>)",
          600: "rgb(var(--zinc-600) / <alpha-value>)",
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
