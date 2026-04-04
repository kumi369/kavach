"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "kavach-theme";
const THEME_EVENT = "kavach-theme-change";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const syncTheme = () => {
      const storedTheme =
        window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
      setTheme(storedTheme);
      document.documentElement.dataset.theme = storedTheme;
    };

    syncTheme();
    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function updateTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel p-1 text-sm shadow-[0_10px_30px_var(--shadow)] backdrop-blur">
      <button
        type="button"
        onClick={() => updateTheme("dark")}
        aria-pressed={theme === "dark"}
        className={`rounded-full px-4 py-2 font-medium transition ${
          theme === "dark"
            ? "bg-slate-950 text-white shadow-sm shadow-slate-950/20"
            : "text-muted hover:text-foreground"
        }`}
      >
        Black
      </button>
      <button
        type="button"
        onClick={() => updateTheme("light")}
        aria-pressed={theme === "light"}
        className={`rounded-full px-4 py-2 font-medium transition ${
          theme === "light"
            ? "bg-cyan-300 text-slate-950 shadow-sm shadow-cyan-400/30"
            : "text-muted hover:text-foreground"
        }`}
      >
        Light
      </button>
    </div>
  );
}
