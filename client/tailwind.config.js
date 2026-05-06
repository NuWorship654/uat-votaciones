/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'uat-blue': '#003087',
        'uat-orange': '#E8521A',
        'uat-blue-light': '#1a4fa0',
        'uat-orange-light': '#f06030',
      }
    }
  },
  plugins: []
}
