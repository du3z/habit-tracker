export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          light: "#f8fafc",
          dark: "#0f172a",
        },
        card: {
          light: "#ffffff",
          dark: "#1e293b",
        },
      },
    },
  },
  plugins: [],
};
