/** Tailwind configuration with a custom primary color palette */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5faff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#1E40AF', // deep blue
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1a2a8a',
          900: '#172554',
        },
      },
    },
  },
  plugins: [],
}
