/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        waskita: {
          bg: "var(--waskita-bg)",
          card: "var(--waskita-card)",
          audit: "var(--waskita-audit-bg)",
          accent: "var(--waskita-accent-primary)",
          subtle: "var(--waskita-accent-subtle)",
          text: "var(--waskita-text)",
        }
      }
    },
  },
  plugins: [],
}
