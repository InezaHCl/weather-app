/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#fff",
        blackText: "#222",
        primary: "#13ce66",
        primary_dark: "#033022",
        secondary: "#f59f00",
        secondary_light: "#fab005",
        secondary_lighter: "#fcc419",
        gray: "#8492a6",
        gray_dark: "#273444",
        gray_light: "#d3dce6",
      },
    },
  },
  plugins: [],
};
