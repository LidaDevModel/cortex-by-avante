"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cortex-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("cortex-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="absolute bottom-[72px] md:bottom-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors duration-100 hover:bg-foreground/5"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
