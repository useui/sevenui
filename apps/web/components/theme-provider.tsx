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

// TEMPORARY BRIDGE (spec §20.1). The site's storage key is now `theme`, but
// the key is a cross-repo contract: the pro previews are served same-origin
// through vercel.json's /previews/* rewrite and sync theme over the native
// `storage` event, which packages/presets/apply.ts names explicitly. Without
// this one-way mirror, /blocks previews lose theme sync between the web
// cutover and the pro deploy — 16 pages, the site's most hand-tuned surface.
//
// DELETE THIS once the pro repo reads `theme`. Nothing automated can observe
// that condition; it has to be remembered by a person.
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
