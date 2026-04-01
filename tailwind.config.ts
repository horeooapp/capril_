import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        qapril: {
          navy:   "#1B3A6B",
          amber:  "#F5A800",
          green:  "#007A4D",
          red:    "#CC2020",
          orange: "#C05000",
          blue:   "#1B5AAA",
          bg:     "#EEF3FB",
          border: "#D0DFF5",
          light:  "#F0F5FF",
          muted:  "#4A6A8A",
        }
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
