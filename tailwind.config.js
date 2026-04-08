/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2f8f83',
        success: '#00a870',
        warning: '#f59a23',
        grayText: '#999',
      },
      borderRadius: {
        md: '8px',
      },
    },
  },
  plugins: [],
};
