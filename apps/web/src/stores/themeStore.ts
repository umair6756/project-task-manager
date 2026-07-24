import { create } from "zustand";

type Theme = "dark" | "light";

const KEY = "flowforge.theme";

function apply(theme: Theme): void {
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const initial = (localStorage.getItem(KEY) as Theme | null) ?? "dark";
apply(initial);

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next);
    apply(next);
    set({ theme: next });
  },
}));
