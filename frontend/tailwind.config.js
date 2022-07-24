/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
        }
    }
  },
  plugins: [require('flowbite/plugin')],
}
