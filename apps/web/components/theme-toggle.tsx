"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      aria-label="Toggle color theme"
      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      type="button"
    >
      <span className="inline-flex dark:hidden">
        <Sun aria-hidden="true" size={18} />
      </span>
      <span className="hidden dark:inline-flex">
        <Moon aria-hidden="true" size={18} />
      </span>
    </button>
  );
}
