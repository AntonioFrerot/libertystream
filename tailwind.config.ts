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
        kick: {
          green: "#b57bff",
          "green-dim": "#9333ea",
          bg: "#1e1a28",
          surface: "#2a2438",
          border: "#3d3554",
          hover: "#342e48",
        },
        void: {
          DEFAULT: "#1a1525",
          50: "#221c30",
          100: "#2a2438",
          200: "#322a42",
          300: "#3a304c",
        },
        neon: {
          cyan: "#c4b5fd",
          purple: "#a855f7",
          blue: "#8b5cf6",
          gold: "#d4af37",
        },
        glass: {
          DEFAULT: "rgba(168, 85, 247, 0.05)",
          border: "rgba(168, 85, 247, 0.14)",
          hover: "rgba(168, 85, 247, 0.1)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient":
          "radial-gradient(at 40% 20%, rgba(168, 85, 247, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139, 92, 246, 0.08) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(109, 40, 217, 0.06) 0px, transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(168, 85, 247, 0.2)",
        "glow-purple": "0 0 24px rgba(168, 85, 247, 0.25)",
        "glow-gold": "0 0 20px rgba(212, 175, 55, 0.2)",
        glass: "0 8px 32px rgba(26, 21, 37, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
