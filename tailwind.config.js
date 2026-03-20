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
          bg: '#F5F7FA',
          surface: '#FFFFFF',
          frame: '#E2E8F0',
          'frame-light': '#F1F5F9',
          accent: '#38BDF8',
          'accent-warm': '#818CF8',
          text: '#1E293B',
          muted: '#64748B',
        }
      }
    },
  },
  plugins: [],
}
