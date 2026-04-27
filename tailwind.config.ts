import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#e2e8f0",
        input: "#f1f5f9",
        ring: "#ef4444",
        background: "#f8fafc",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "#2563eb", // Vibrant Blue
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#ffffff",
          foreground: "#1e293b",
        },
        destructive: {
          DEFAULT: "#ef4444", // Bright Red
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#94a3b8",
          foreground: "#475569",
        },
        accent: {
          DEFAULT: "#6366f1", // Indigo
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        warning: "#f59e0b", // Amber
        success: "#10b981", // Emerald
        info: "#3b82f6", // Blue
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulseBorder: {
          "0%, 100%": { borderColor: "rgba(229, 62, 62, 1)", boxShadow: "0 0 15px rgba(229, 62, 62, 0.4)" },
          "50%": { borderColor: "rgba(229, 62, 62, 0.3)", boxShadow: "0 0 5px rgba(229, 62, 62, 0.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-border": "pulseBorder 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
