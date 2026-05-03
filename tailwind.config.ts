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
          DEFAULT: "#111111",
          elevated: "#161616",
          card: "#18181b",
        },
        accent: {
          DEFAULT: "#ef4444",
          hover: "#dc2626",
          soft: "rgba(239,68,68,0.1)",
        },
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(ellipse at top, rgba(239,68,68,0.15), transparent 60%)",
        "card-gradient":
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
      },
      boxShadow: {
        "glow-red": "0 0 40px -8px rgba(239,68,68,0.4)",
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
