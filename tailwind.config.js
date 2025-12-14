/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        burgundy: {
          50:  '#f9eef2',
          100: '#f2d9e1',
          200: '#e6b3c4',
          300: '#d98da7',
          400: '#cc668a',
          500: '#993350',
          600: '#6B1E3A',
          700: '#45081E',
          800: '#20040E',
          850: '#17030B',
          900: 'black',
        },
        primary: '#45081E',
        'primary-darker': '#300615',
        secondary: '#20040E',
        'secondary-darker': '#17030B',
        background: 'black',
        'modal-background': '#150407',
        text: '#CECCCD',
        accent: '#AA9D15',
        border: '#45081E',
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
