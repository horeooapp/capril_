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
        ink: "var(--ink)",
        ink2: "var(--ink2)",
        ink3: "var(--ink3)",
        ink4: "var(--ink4)",
        cream: "var(--cream)",
        cream2: "var(--cream2)",
        mango: "var(--mango)",
        "mango-d": "var(--mango-d)",
        "mango-l": "var(--mango-l)",
        sky: "var(--sky)",
        "sky-d": "var(--sky-d)",
        "sky-l": "var(--sky-l)",
        lime: "var(--lime)",
        "lime-d": "var(--lime-d)",
        "lime-l": "var(--lime-l)",
        teal: "var(--teal)",
        fuchsia: "var(--fuchsia)",
        coral: "var(--coral)",
        qapril: {
          navy:   "#0A0F1D", // Midnight Onyx
          amber:  "#CBA358", // Imperial Gold
          green:  "#026343", // Trust Emerald
          red:    "#B31A1A", // Corporate Red
          orange: "#D48B30", // Muted Bronze
          blue:   "#1E3A8A", // Deep Web Blue
          bg:     "#F6F8FA", // Clean Light Grey
          border: "#E2E8F0", // Slate Border
          light:  "#FFFFFF", // Pure surface
          muted:  "#64748B", // Slate Muted
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
