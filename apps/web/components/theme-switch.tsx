"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const optionClass =
  "inline-flex h-[26px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:text-foreground";

/**
 * A two-option light/dark segment for the footer. The pressed state is drawn from the
 * `dark:` variant rather than `resolvedTheme`, so the server render already matches.
 */
export function ThemeSwitch() {
  const { setTheme } = useTheme();

  return (
    <fieldset className="m-0 inline-flex gap-0.5 self-start rounded-[10px] border-0 bg-muted p-[3px]">
      <legend className="sr-only">Color theme</legend>
      <button
        aria-label="Light theme"
        className={`${optionClass} bg-card text-foreground shadow-raised dark:bg-transparent dark:text-muted-foreground dark:shadow-none`}
        onClick={() => setTheme("light")}
        type="button"
      >
        <Sun aria-hidden="true" size={14} />
      </button>
      <button
        aria-label="Dark theme"
        className={`${optionClass} dark:bg-card dark:text-foreground`}
        onClick={() => setTheme("dark")}
        type="button"
      >
        <Moon aria-hidden="true" size={14} />
      </button>
    </fieldset>
  );
}
