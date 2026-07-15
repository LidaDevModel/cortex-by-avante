"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "cortex-theme";

/** The stored value can be a legacy "light"/"dark" or the newer "system". */
function readPreference(): ThemePreference {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

const ThemeContext = createContext<{
  /** What the user chose. "system" follows the device. */
  preference: ThemePreference;
  /** The resolved theme — what's actually painted right now. */
  isDark: boolean;
  setPreference: (preference: ThemePreference) => void;
}>({
  preference: "system",
  isDark: false,
  setPreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [isDark, setIsDark] = useState(false);

  // Bootstrap once: read the saved preference (defaulting to "system" so a
  // first visit follows the device), apply the resolved theme, and — while on
  // "system" — track OS changes live. The provider owns this so every surface
  // (including auth, which has no control) starts on the right theme.
  useEffect(() => {
    const el = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (pref: ThemePreference) => {
      const dark = pref === "system" ? mql.matches : pref === "dark";
      el.classList.toggle("dark", dark);
      setIsDark(dark);
    };

    const pref = readPreference();
    setPreferenceState(pref);
    apply(pref);

    // Only react to OS changes while the user is following the system.
    const onSystemChange = () => {
      if (readPreference() === "system") apply("system");
    };
    mql.addEventListener("change", onSystemChange);
    return () => mql.removeEventListener("change", onSystemChange);
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    const el = document.documentElement;
    localStorage.setItem(STORAGE_KEY, pref);
    setPreferenceState(pref);
    const dark = pref === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches : pref === "dark";
    el.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, isDark, setPreference }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
