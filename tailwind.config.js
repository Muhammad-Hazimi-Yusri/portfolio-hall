/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Theme tokens - will be defined based on final name/theme
      colors: {
        hall: {
          bg: '#1C1410',
          surface: '#2A1F18',
          frame: '#3D2B1E',
          'frame-light': '#5C4033',
          accent: '#C9A84C',
          'accent-warm': '#B8432F',
          text: '#E8DFD0',
          muted: '#9C8B7A',
        }
      }
    },
  },
  plugins: [],
}
