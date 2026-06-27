/** @type {import('tailwindcss').Config} */
// Tailwind CSS config — scans renderer source files for class names
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          light: '#FAF9F7',
          dark: '#1C1C1C'
        },
        accent: {
          DEFAULT: '#D97757',
          hover: '#C4684A',
          muted: '#D9775720'
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)'
      }
    }
  },
  plugins: []
}
