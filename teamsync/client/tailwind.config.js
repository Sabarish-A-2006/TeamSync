/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4F46E5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          500: '#7C3AED',
          600: '#6d28d9',
        },
        available: {
          50: '#f0fdf4',
          500: '#16A34A',
          600: '#15803d',
        },
        unavailable: {
          50: '#fef2f2',
          500: '#DC2626',
          600: '#b91c1c',
        },
        away: {
          50: '#fffbeb',
          500: '#D97706',
          600: '#b45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
