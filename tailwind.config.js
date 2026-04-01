/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700',
        secondary: '#FFA500',
        accent: '#FF6B6B',
        dark: '#1a1a1a',
        light: '#f8f9fa',
      },
    },
  },
  plugins: [],
}
