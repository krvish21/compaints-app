/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        romance: {
          50: '#fdf8f8',
          100: '#fae7e7',
          200: '#f5d0d0',
          300: '#ebadb0',
          400: '#e07e84',
          500: '#d65d65',
          600: '#c33e47',
          700: '#a32f37',
          800: '#862b32',
          900: '#712830',
        },
        muted: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        }
      },
      animation: {
        'scratch': 'scratch 0.5s ease-out forwards',
      },
      keyframes: {
        scratch: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
} 