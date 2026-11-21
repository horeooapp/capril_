/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1F2A44",
          dark: "#141C30",
          light: "#2C3E6B",
        },
        locataire: {
          DEFAULT: "#2C3E6B",
          dark: "#1E2B4A",
          light: "#E0E7FF",
        },
        bailleur: {
          DEFAULT: "#1B4D3E",
          dark: "#13372C",
          gold: "#E8A020",
          light: "#ECFDF5",
        },
      },
    },
  },
  plugins: [],
};
