/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7F77DD",
        "primary-dark": "#6860C8",
        surface: "#F5F5F5",
        card: "#FFFFFF",
        ink: "#1a1a1a",
      },
      borderRadius: {
        card: "12px",
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
