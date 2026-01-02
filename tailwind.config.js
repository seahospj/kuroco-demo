import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f9fb',
          100: '#e9f1f8',
          200: '#cfe0ef',
          300: '#a8c5e0',
          400: '#7ca7cd',
          500: '#5f8eb9',
          600: '#4c759d',
          700: '#3f6183',
          800: '#354f6b',
          900: '#2e4259'
        }
      }
    }
  },
  plugins: [typography]
};

