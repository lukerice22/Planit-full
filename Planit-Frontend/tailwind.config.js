/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'be_vietnam_pro': ["'Be Vietnam Pro'", 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '-200% 0' },
          '50%':      { backgroundPosition: '200% 0' },
        },
        rainbowShimmer: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
        rainbowShimmer: 'rainbowShimmer 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}