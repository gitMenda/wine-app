/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        burgundy: {
          50:  '#fce8ee', 
          100: '#fad1dd',
          200: '#f5a3bc',
          300: '#f0759a',
          400: '#eb4778',
          500: '#e61957', //BB1749
          600: '#a5123e',
          700: '#8a0f34',
          800: '#5c0a23',
          900: '#45081a',
          950: '#2e0511',
          975: '#0F0105',
        }
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
