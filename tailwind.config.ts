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
        },
        qnavy: {
          DEFAULT: "var(--color-qnavy, #0F1117)",
          dark: "var(--color-qnavy-dark, #05080F)",
          light: "var(--color-qnavy-light, #2A2D3A)",
          pale: "var(--color-qnavy-pale, #F1F4F9)",
        },
        "qnavy-dark": "var(--color-qnavy-dark, #05080F)",
        "qnavy-light": "var(--color-qnavy-light, #2A2D3A)",
        "qnavy-pale": "var(--color-qnavy-pale, #F1F4F9)",
        qgreen: {
          DEFAULT: "var(--color-qgreen, #00C896)",
          dark: "var(--color-qgreen-dark, #026343)",
          light: "var(--color-qgreen-light, #CCFAEE)",
          pale: "var(--color-qgreen-pale, #E6F0EC)",
        },
        "qgreen-dark": "var(--color-qgreen-dark, #026343)",
        "qgreen-light": "var(--color-qgreen-light, #CCFAEE)",
        "qgreen-pale": "var(--color-qgreen-pale, #E6F0EC)",
        qorange: {
          DEFAULT: "var(--color-qorange, #FF8B00)",
          dark: "var(--color-qorange-dark, #D47400)",
          light: "var(--color-qorange-light, #FFD180)",
          pale: "var(--color-qorange-pale, #FFF4E5)",
        },
        "qorange-dark": "var(--color-qorange-dark, #D47400)",
        "qorange-light": "var(--color-qorange-light, #FFD180)",
        "qorange-pale": "var(--color-qorange-pale, #FFF4E5)",
        qred: {
          DEFAULT: "var(--color-qred, #FF4E50)",
          dark: "var(--color-qred-dark, #B31A1A)",
          pale: "var(--color-qred-pale, #FFE8E8)",
        },
        "qred-dark": "var(--color-qred-dark, #B31A1A)",
        "qred-pale": "var(--color-qred-pale, #FFE8E8)",
        qtext: {
          DEFAULT: "var(--color-qtext, #0F172A)",
          mid: "var(--color-qtext-mid, #334155)",
          light: "var(--color-qtext-light, #64748B)",
        },
        "qtext-mid": "var(--color-qtext-mid, #334155)",
        "qtext-light": "var(--color-qtext-light, #64748B)",
        "qgrey-1": "var(--color-qgrey-1, #F8FAFC)",
        "qgrey-2": "var(--color-qgrey-2, #E2E8F0)",
        "qgrey-3": "var(--color-qgrey-3, #94A3B8)",
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
