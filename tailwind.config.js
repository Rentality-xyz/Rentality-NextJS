/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'filter-bg-color': '#1e1e30',
        'rentality-bg-dark': '#0b0b0d',
        'rentality-action-light': '#7da2f6',
        'rentality-action-medium': '#7f5ee7',
        'rentality-action-dark': '#593ec0',        
      },
    },
  },
  plugins: [],
}
