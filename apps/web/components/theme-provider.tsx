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
// `storage` event, which packages/presets/apply.ts names explicitly. The
// same-origin part is what makes that work at all: the iframe src is the
// RELATIVE `/previews/${item.name}` built in
// app/blocks/[group]/[category]/page.tsx, so the preview document shares this
// document's origin and receives its `storage` events. A cross-origin frame
// would not, and this bridge would be pointless. Without this one-way mirror,
// /blocks previews lose theme sync between the web cutover and the pro
// deploy — the site's most hand-tuned surface.
//
// HOW BIG THAT SURFACE IS, as a rule rather than a figure to transcribe: it
// is derived from the pro manifest, which §10 owns, as 1 index + 1 per group
// + 1 per category. At 4 groups and 19 categories that is 24 ROUTES AS OF
// 2026-09-21 (§20.1). Of those, only the 19 CATEGORY routes embed previews —
// the index and the four group pages carry no iframe at all — so 19 is this
// bridge's actual blast radius and 24 is the surface it sits on. Both move
// with the manifest: re-derive them, do not trust this sentence. (This read
// "16 pages" until 2026-09-21, which is why it now names the rule.)
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
