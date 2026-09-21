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
 * Applied in exactly ONE place (§16.8) — `lib/metadata.tsx`'s `pageMetadata`
 * and `notFoundMetadata` are the only callers of this function anywhere in
 * the repo. No route's `generateMetadata` calls it directly any more (that
 * was true before task-9.2b; every route has since been routed through
 * `lib/metadata.tsx` instead), which is what makes "exactly ONE place"
 * literal rather than aspirational: the OG card, the `<title>` and
 * `og:title`/`twitter:title` all come from the same suffix call.
 */
export const pageTitle = (bare: string): string =>
  bare === site.name ? site.name : `${bare} — ${site.name}`;
