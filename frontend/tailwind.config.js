/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: '#1B4332',
          light: '#2D5A46',
          dark: '#112D22',
        },
        terracotta: {
          DEFAULT: '#BC6C25',
          light: '#DDA15E',
          dark: '#8B4F1B',
        },
        cream: {
          DEFAULT: '#FAF6EF',
          dark: '#F3EDE2',
        },
        charcoal: {
          DEFAULT: '#2D2A26',
          light: '#4E4A45',
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Spectral', 'serif'],
        sans: ['"Work Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
