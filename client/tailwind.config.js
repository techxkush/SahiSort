/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFDFB',
          100: '#FBFBF7',
          200: '#F6F5EE',
          300: '#EFECE2',
          400: '#E5E0D2',
          500: '#D5CDBE',
        },
        forest: {
          50: '#F0F5F2',
          100: '#E0EDE6',
          200: '#C0DBCF',
          300: '#94C2AF',
          400: '#5BA286',
          500: '#348265',
          600: '#25674F',
          700: '#1F5340',
          800: '#1A382B',
          900: '#12261E',
          950: '#0A1813',
        },
        earth: {
          sand: '#ECE7DC',
          clay: '#DFD8C8',
          terracotta: '#C86D49',
          terracottaDark: '#A85331',
          moss: '#6A8064',
          ochre: '#C98A3C',
          charcoal: '#1A211D',
          muted: '#5A675F',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(27, 43, 34, 0.05), 0 2px 6px -1px rgba(27, 43, 34, 0.03)',
        'lifted': '0 10px 30px -4px rgba(27, 43, 34, 0.08), 0 4px 10px -2px rgba(27, 43, 34, 0.04)',
      }
    },
  },
  plugins: [],
}
