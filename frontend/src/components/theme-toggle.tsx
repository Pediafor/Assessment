"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : undefined;

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-card"
    >
      {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : (
        // Render a stable placeholder during SSR to avoid hydration mismatch
        <span className="inline-block h-4 w-4 rounded-full border" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{mounted ? (isDark ? "Light" : "Dark") : "Theme"} mode</span>
    </button>
  );
}
