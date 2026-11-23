import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        rawaei: {
          gold: "#C49A45",
          "gold-light": "#DFC27A",
          "gold-dark": "#98702B",
          "gold-deep": "#6E4E18",
          black: "#171717",
          "black-pure": "#0C0C0C",
          "black-soft": "#1F1F1F",
          "black-card": "#141414",
          ivory: "#F8F5EF",
          "ivory-dark": "#EFE9DC",
          "ivory-light": "#FCFAF7",
          charcoal: "#232323",
          border: "rgba(196, 154, 69, 0.2)",
          "border-dark": "rgba(255, 255, 255, 0.08)",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
        "glass-gold": "0 8px 32px 0 rgba(196, 154, 69, 0.15)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        "gold-glow": "0 0 25px rgba(196, 154, 69, 0.35)",
        "gold-glow-lg": "0 0 45px rgba(196, 154, 69, 0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
