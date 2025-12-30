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
          bg: '#1a1a2e',
          surface: '#16213e',
          accent: '#e94560',
          text: '#eaeaea',
          muted: '#a0a0a0',
        }
      }
    },
  },
  plugins: [],
}
