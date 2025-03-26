/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00D09C",
        secondary: "#5367FF",
        dark: "#121212",
        light: "#F8F8F8",
        danger: "#FF5353",
        success: "#00D09C",
      }
    },
  },
  plugins: [],
}