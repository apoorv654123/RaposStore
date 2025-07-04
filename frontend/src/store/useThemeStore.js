import { create } from 'zustand';

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("preferred-theme") || "dark",
    setTheme: (theme) => {
        localStorage.setItem("preferred-theme", theme);
        set({ theme });
    }
}));