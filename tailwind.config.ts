import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(220 17% 22%)",
        input: "hsl(220 17% 22%)",
        ring: "hsl(151 68% 52%)",
        background: "hsl(222 34% 7%)",
        foreground: "hsl(210 20% 98%)",
        muted: {
          DEFAULT: "hsl(221 25% 14%)",
          foreground: "hsl(215 20% 70%)"
        },
        card: {
          DEFAULT: "hsl(223 28% 11%)",
          foreground: "hsl(210 20% 98%)"
        },
        primary: {
          DEFAULT: "hsl(151 68% 52%)",
          foreground: "hsl(160 100% 8%)"
        },
        secondary: {
          DEFAULT: "hsl(218 29% 18%)",
          foreground: "hsl(210 20% 98%)"
        },
        accent: {
          DEFAULT: "hsl(39 100% 66%)",
          foreground: "hsl(25 95% 11%)"
        },
        danger: {
          DEFAULT: "hsl(0 84% 62%)",
          foreground: "hsl(0 0% 100%)"
        }
      },
      boxShadow: {
        glow: "0 18px 80px rgba(17, 231, 161, 0.18)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  },
  plugins: []
} satisfies Config;
