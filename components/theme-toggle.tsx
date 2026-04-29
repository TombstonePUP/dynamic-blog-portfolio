"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex h-9 w-9 items-center justify-center border border-admin-surface-hover bg-admin-surface text-admin-muted transition-colors hover:bg-admin-surface-hover hover:text-admin-text">
        <span className="sr-only">Loading theme</span>
        <div className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`${className} flex h-9 w-9 items-center justify-center text-admin-muted transition-colors hover:bg-admin-surface-hover hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 transition-all" />
      ) : (
        <Moon className="h-4 w-4 transition-all" />
      )}
    </button>
  );
}
