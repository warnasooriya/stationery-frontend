/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#450a0a',
          900: '#7f1d1d',
          800: '#991b1b',
          700: '#b91c1c',
          600: '#dc2626'
        },
        accent: {
          700: '#b91c1c',
          600: '#dc2626',
          500: '#ef4444'
        },
        ui: {
          bg: '#ffffff',
          card: '#ffffff',
          border: '#e5e7eb',
          muted: '#6b7280'
        }
      }
    }
  },
  plugins: []
};
