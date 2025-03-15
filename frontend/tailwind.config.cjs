/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        // Animate gradient continuously from 0% to -100% over 10s
        gradient: 'gradient 6s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '-100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
