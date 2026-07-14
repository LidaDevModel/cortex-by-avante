"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";

const ThemeContext = createContext<{ isDark: boolean; setDark: (dark: boolean) => void }>({
  isDark: false,
  setDark: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    // Bootstrap: apply the saved preference (system default on first visit).
    // This lived in the floating DarkModeToggle before the control moved to
    // Profile → Appearance; the provider now owns it so every surface
    // (including auth, which has no toggle) starts on the right theme.
    const saved = localStorage.getItem("cortex-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    el.classList.toggle("dark", saved ? saved === "dark" : prefersDark);
    setIsDark(el.classList.contains("dark"));
    const obs = new MutationObserver(() => setIsDark(el.classList.contains("dark")));
    obs.observe(el, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const setDark = useCallback((dark: boolean) => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("cortex-theme", dark ? "dark" : "light");
  }, []);

  return <ThemeContext.Provider value={{ isDark, setDark }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
