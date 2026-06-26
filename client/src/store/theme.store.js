import { create } from "zustand";

const STORAGE_KEY = "theme";

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem(STORAGE_KEY, theme);
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  init() {
    applyTheme(get().theme);
  },

  toggleTheme() {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },

  setTheme(theme) {
    applyTheme(theme);
    set({ theme });
  },
}));
