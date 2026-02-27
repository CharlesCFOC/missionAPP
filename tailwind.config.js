/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#271c70', // Bleu CFOC
        accent: '#ff9c4b',  // Orange CFOC
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};