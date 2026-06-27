/** @type {import('tailwindcss').Config} */
// Tailwind CSS config — scans renderer source files for class names
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        surface: {
          light: '#FAF9F7'
        },
        accent: {
          DEFAULT: '#D97757',
          hover: '#C4684A',
          muted: '#D9775720'
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
      }
    }
  },
  plugins: []
}
