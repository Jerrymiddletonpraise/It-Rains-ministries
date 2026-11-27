import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1320px" } },
    extend: {
      colors: {
        ink: { DEFAULT: "hsl(var(--ink))", soft: "hsl(var(--ink-soft))" },
        charcoal: { DEFAULT: "hsl(var(--charcoal))", light: "hsl(var(--charcoal-light))" },
        gold: { DEFAULT: "hsl(var(--gold))", light: "hsl(var(--gold-light))", deep: "hsl(var(--gold-deep))" },
        ivory: { DEFAULT: "hsl(var(--ivory))", muted: "hsl(var(--ivory-muted))" },
        line: "hsl(var(--line))",
        danger: "hsl(var(--danger))",
        live: "hsl(var(--live))",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
      },
      letterSpacing: { luxe: "0.28em" },
      boxShadow: {
        luxe: "0 30px 60px -20px rgba(0,0,0,0.65), 0 0 0 1px hsl(var(--line))",
        glow: "0 0 40px -8px hsl(var(--gold) / 0.45)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        "slow-zoom": { from: { transform: "scale(1)" }, to: { transform: "scale(1.08)" } },
        rays: { "0%,100%": { opacity: "0.35" }, "50%": { opacity: "0.7" } },
        pulse_live: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(.2,.7,.2,1) both",
        "slow-zoom": "slow-zoom 24s ease-in-out infinite alternate",
        rays: "rays 8s ease-in-out infinite",
        live: "pulse_live 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
