/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF5EE',
          100: '#FFE8D6',
          200: '#FECBA0',
          300: '#FDB06A',
          400: '#F4A261',
          500: '#F08040',
          600: '#E76F51',
          700: '#C75A3C',
          800: '#A04530',
          900: '#7A3222',
        },
        secondary: {
          50:  '#FFF0F0',
          100: '#FDE8E8',
          200: '#FBCECE',
          300: '#F8ABAB',
          400: '#F47F7F',
          500: '#EF5656',
          600: '#E03333',
          700: '#BE2424',
          800: '#9D1F1F',
          900: '#821E1E',
        },
        accent: {
          50:  '#FDFAEE',
          100: '#FAF3CC',
          200: '#F5E68A',
          300: '#EDD447',
          400: '#D4AF37',
          500: '#B8960F',
          600: '#9C7B0B',
          700: '#7D620C',
          800: '#664F10',
          900: '#554213',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

