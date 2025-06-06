/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        burgundy: {
          50:  '#f9f4f7', 
          100: '#f2e3eb',
          200: '#ddb3c1',
          300: '#c88da3',
          400: '#b26081',
          500: '#993266', 
          600: '#7e2754',
          700: '#642042',
          800: '#4d1835',
          900: '#3b122a',
        }
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
