/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coy: {
          pink: "#FF2B6D",
          pinkHover: "#E01C5B",
          dark: "#1A1A1A",
          cardBg: "#FFF9F6",
          softPurple: "#EEEBFF",
          border: "#1C1C1E",
          tagBg: "#F3F4F6",
        }
      },
      boxShadow: {
        'coy': '3px 4px 0px #1C1C1E',
        'coy-sm': '2px 2px 0px #1C1C1E',
        'coy-lg': '5px 6px 0px #1C1C1E',
        'coy-active': '1px 1px 0px #1C1C1E',
      }
    },
  },
  plugins: [],
}
