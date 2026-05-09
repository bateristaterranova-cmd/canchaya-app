/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39FF14',
        'neon-green-light': '#5FFF3F',
        'neon-green-dark': '#2BCC10',
      },
    },
  },
  plugins: [],
};
