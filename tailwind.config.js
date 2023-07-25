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
        'rentality-bg-dark': '#0b0b0d',

        'rentality-bg': '#1e1e30', //menu bg, filter, your chat msg bg
        'rentality-primary': '#6600cd', // menu selected bg, other chat msg bg
        'rentality-primary2': '#7c58d7', // menu notifacation
        'rentality-secondary': '#22d7d3', //sale bg, some (i) text, 
        'rentality-icons': '#c0aeff',
        
        'rentality-button-light': '#7da2f6',
        'rentality-button-medium': '#7f5ee7',
        'rentality-button-dark': '#593ec0',

        'status-pending': '#7c58d7',
        'status-on-trip': '#220e50',
        'status-completed': '#22d7d3',
        
      },
    },
  },
  plugins: [],
}
