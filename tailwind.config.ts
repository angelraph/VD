import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "v-black": "#020917",
        "v-darker": "#010611",
        "v-dark": "#0d1526",
        "v-card": "#0a1020",
        "v-blue": "#00d4ff",
        "v-violet": "#7c3aed",
        "v-green": "#00ff9d",
        "v-red": "#ff3366",
        "v-amber": "#fbbf24",
        "v-muted": "#1e2d47",
        "v-text": "#94a3b8",
        "v-dim": "#334155",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)",
        "glow-cyan":
          "radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)",
        "glow-violet":
          "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
        "hero-gradient":
          "radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.07) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(0,255,157,0.03) 0%, transparent 50%)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanLine 3s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        typewriter: "typewriter 3s steps(40) forwards",
        flicker: "flicker 4s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "counter-up": "counterUp 0.3s ease-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.95)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.4" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.6" },
          "97%": { opacity: "1" },
        },
        counterUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)",
        "glow-violet": "0 0 20px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.1)",
        "glow-green": "0 0 20px rgba(0,255,157,0.3), 0 0 40px rgba(0,255,157,0.1)",
        "glow-red": "0 0 20px rgba(255,51,102,0.3), 0 0 40px rgba(255,51,102,0.1)",
        glass: "0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-hover": "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      borderColor: {
        glass: "rgba(255,255,255,0.06)",
        "glass-bright": "rgba(255,255,255,0.12)",
        "cyan-dim": "rgba(0,212,255,0.2)",
        "violet-dim": "rgba(124,58,237,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
