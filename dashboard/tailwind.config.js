/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Work Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        background: "var(--bg-color)",
        foreground: "var(--text-color)",
        card: "var(--card-bg)",
        border: "var(--border-color)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        defective: "#ef4444", // Solid Red
        clean: "#10b981",    // Solid Green
      },
      boxShadow: {
        'flat': '3px 3px 0px 0px rgba(0,0,0,0.1)',
        'flat-dark': '3px 3px 0px 0px rgba(0,0,0,0.5)',
      }
    },
  },
  plugins: [],
}
