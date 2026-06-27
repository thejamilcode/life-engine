/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Hind Siliguri', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        teal: {
          950: '#042f2e',
        }
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      screens: {
        'xs': '400px',
      }
    },
  },
  plugins: [],
}
