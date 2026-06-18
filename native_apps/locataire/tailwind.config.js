/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FFFBF5",
        foreground: "#0F1117",
        qnavy: {
          DEFAULT: "#0F1117",
          dark: "#05080F",
          light: "#2A2D3A",
          pale: "#F1F4F9",
        },
        qgreen: {
          DEFAULT: "#00C896",
          light: "#CCFAEE",
          pale: "#E6F0EC",
        },
        qorange: {
          DEFAULT: "#FF8B00",
          pale: "#FFF0D6",
        },
        qred: {
          DEFAULT: "#FF4E50",
          pale: "#FFE8E8",
        },
        qteal: {
          DEFAULT: "#00B4D8",
          pale: "#D0F4FC",
        },
        qpurple: {
          DEFAULT: "#E040FB",
          pale: "#FCE4FF",
        },
        qgrey: {
          1: "#F8FAFC",
          2: "#E2E8F0",
          3: "#94A3B8",
          4: "#475569",
        },
        qtext: {
          DEFAULT: "#0F172A",
          mid: "#334155",
          light: "#64748B",
        }
      }
    },
  },
  plugins: [],
}
