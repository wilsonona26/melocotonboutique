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
          50:  '#FFF0F7',
          100: '#FFE0EF',
          200: '#FFC2DF',
          300: '#FF85BF',
          400: '#FF479F',
          500: '#FF008C',
          600: '#E0007B',
          700: '#B80065',
          800: '#8F004F',
          900: '#6B003B',
        },
        secondary: {
          50:  '#F7F7F7',
          100: '#E8E8E8',
          200: '#D4D4D4',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
          600: '#333333',
          700: '#222222',
          800: '#1A1A1A',
          900: '#000000',
        },
        accent: {
          50:  '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#E5E5E5',
          400: '#D4D4D4',
          500: '#A3A3A3',
          600: '#737373',
          700: '#525252',
          800: '#333333',
          900: '#1A1A1A',
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

