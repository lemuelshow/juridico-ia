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
        navy: {
          50:  '#f0f4fa',
          100: '#d9e4f5',
          200: '#b3c9eb',
          300: '#8daedf',
          400: '#6793d3',
          500: '#4178c7',
          600: '#2d5ea8',
          700: '#1e3a5f',
          800: '#152843',
          900: '#0c1827',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
