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
          50: '#fef7f2',
          100: '#fdeee5',
          200: '#fbdccb',
          300: '#f8c1a1',
          400: '#f4a377',
          500: '#f0854d',
          600: '#E95420', // Laranja principal
          700: '#c2471a',
          800: '#9b3914',
          900: '#7a2d10',
        },
        secondary: {
          50: '#f0f9f0',
          100: '#d9f2d9',
          200: '#b3e6b3',
          300: '#8dd98d',
          400: '#67cc67',
          500: '#4CAF50', // Verde principal
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d2e',
          900: '#256b25',
        },
        accent: {
          50: '#f0f4f8',
          100: '#d6e3ef',
          200: '#adc7df',
          300: '#84abcf',
          400: '#5b8fbf',
          500: '#326faf',
          600: '#003F5C', // Azul marinho principal
          700: '#003651',
          800: '#002d46',
          900: '#00243b',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}