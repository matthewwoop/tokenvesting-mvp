module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [
    require('@shadcn/ui/tailwind-preset')
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};