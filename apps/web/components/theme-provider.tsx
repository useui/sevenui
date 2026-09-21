"use client";

import { ThemeProvider as NextThemes, useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      storageKey="theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme={false}
    >
      <BlumeThemeMirror />
      {children}
    </NextThemes>
  );
}

function BlumeThemeMirror() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme) {
      try {
        localStorage.setItem("blume-theme", resolvedTheme);
      } catch {}
    }
  }, [resolvedTheme]);
  return null;
}
