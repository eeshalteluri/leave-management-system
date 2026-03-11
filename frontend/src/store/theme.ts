import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {

  // Initialise from localStorage, fall back to OS preference
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = ref<boolean>(stored ? stored === "dark" : prefersDark);

  function applyTheme(): void {
    if (isDark.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function toggle(): void {
    isDark.value = !isDark.value;
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
    applyTheme();
  }

  // Apply immediately on store init
  applyTheme();

  return { isDark, toggle };
});