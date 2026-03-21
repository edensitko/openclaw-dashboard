"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useChartTheme() {
  const { theme } = useTheme();
  const d = theme === "dark";
  return {
    grid: d ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    axis: d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)",
    tick: d ? "#7A7A9E" : "#8E8E93",
    tooltip: {
      background: d ? "rgba(13,13,26,0.95)" : "rgba(255,255,255,0.95)",
      border: `1px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
      borderRadius: "14px",
      color: d ? "#fff" : "#1C1C1E",
      fontSize: "12px",
    },
    pieFree: d ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  };
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
