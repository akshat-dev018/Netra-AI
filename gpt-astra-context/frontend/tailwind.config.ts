/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#DEEBEC',
        primary: '#11315F',
        critical: '#EF270B',
        warning: '#EC7507',
        success: '#278B56',
      },
    },
  },
  plugins: [],
};
