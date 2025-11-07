/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0D0D0D',
        'bg-panel': '#111111',
        'bg-card': '#1a1a1a',
        'border-color': '#222222',
        'accent': '#FFFFFF',
        'accent-hover': '#D1D5DB',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        'danger': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

