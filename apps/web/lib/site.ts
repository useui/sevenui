export const site = {
  name: "SevenUI",
  description: "Base UI powered primitives, distributed through the shadcn registry.",
  url: "https://sevenui.dev",
  github: { owner: "useui", repo: "sevenui" },
} as const;

/**
 * §15.8: every <title> ends with `SevenUI`, separated by an em dash. The
 * landing page is the sole exception and stays bare `SevenUI`.
 *
 * Applied in exactly ONE place — each page's generateMetadata reads the bare
 * title from lib/page-meta.ts and passes it through here — so the OG card and
 * the tab can never disagree (§16.8).
 */
export const pageTitle = (bare: string): string =>
  bare === site.name ? site.name : `${bare} — ${site.name}`;
