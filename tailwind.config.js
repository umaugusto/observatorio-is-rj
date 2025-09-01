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
          50: '#fff5f5',
          100: '#ffe5e5',
          200: '#ffcccc',
          300: '#ffb3b3',
          400: '#ff9999',
          500: '#ff8080',
          600: '#FF6B6B', // Coral/Laranja da identidade visual como cor principal dos botões
          700: '#e55555',
          800: '#cc4040',
          900: '#b32a2a',
        },
        secondary: {
          50: '#f0f9f0',
          100: '#d9f2d9', 
          200: '#b3e6b3',
          300: '#8dd98d',
          400: '#67cc67',
          500: '#4CAF50', // Verde médio
          600: '#5CB85C', // Verde claro da identidade
          700: '#388e3c',
          800: '#2e7d2e',
          900: '#256b25',
        },
        navy: {
          50: '#f0f8f9',
          100: '#d9eef2',
          200: '#b3dce5',
          300: '#8cc9d7',
          400: '#66b7ca',
          500: '#40a4bd',
          600: '#1B5E6B', // Navy/Azul escuro da identidade
          700: '#164a54',
          800: '#11363d',
          900: '#0c2226',
        },
        accent: {
          50: '#fff5f5',
          100: '#ffe5e5',
          200: '#ffcccc',
          300: '#ffb3b3',
          400: '#ff9999',
          500: '#ff8080',
          600: '#FF6B6B', // Coral da identidade
          700: '#e55555',
          800: '#cc4040',
          900: '#b32a2a',
        },
        danger: {
          50: '#fdf2f2',
          100: '#fce4e4',
          200: '#f9c9c9',
          300: '#f5a9a9',
          400: '#f28989',
          500: '#ef6969',
          600: '#E74C3C', // Vermelho da identidade
          700: '#c0392b',
          800: '#992d22',
          900: '#72211a',
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