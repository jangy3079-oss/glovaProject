/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'toss-blue': '#47a432',
        'toss-grey': '#4e5968',
        'toss-bg': '#F9FBFA',
        'white-garden': '#F9FBFA',
        'deep-green': '#3ea331',
        'deep-emerald': '#2e7d32',
        'brand-50': '#F0FDF4',
        brand: {
          500: '#47a432',
          600: '#3e8f2c',
          700: '#357a26',
          800: '#2c6520',
          900: '#23501a',
        }
      }
    },
  },
  plugins: [],
}
