/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1511',
        primary: '#95d4ac',
        'primary-container': '#0f5132',
        'on-primary-fixed-variant': '#0f5132',
        secondary: '#77da9f',
        tertiary: '#fabd00',
        error: '#ffb4ab',
        'surface-container-high': '#252b27',
        'on-surface-variant': '#c0c9c0',
        'surface-dim': '#0f1511',
        'on-primary-container': '#84c39b',
        'on-secondary-container': '#a7ffc7',
        'on-tertiary-container': '#e4ac00',
        'surface-container-low': '#171d19',
        'surface-container-lowest': '#0a100c',
        'surface-container-highest': '#303632',
        'on-surface': '#dee4dd',
        'outline': '#8a938b',
        'outline-variant': '#404942',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
