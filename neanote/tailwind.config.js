/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,tsx,ts,jsx,css,scss}"],
  theme: {
    extend: {
      colors: {
        "mainBackgroundColor":"#192626",
        "secondaryBackgroundColor": "#191f1f",
        "accentColor": "#408777",
        "primaryColor" :"#539784",
        "secondaryColor" :"#267d67",
    },
  },
  plugins: [],
}
}
