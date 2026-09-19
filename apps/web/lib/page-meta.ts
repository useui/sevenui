import { site } from "./site";

export type PageMeta = { title: string; description: string };

/** Custom pages: declared explicitly. Docs come from the content index
 *  (Stage 2), blocks from the pro manifest (Stage 5).
 *
 *  Descriptions below are copied verbatim from each live page's own
 *  `<meta name="description">` on https://sevenui.dev — see
 *  task-1.7-report.md for the raw probe output.
 *
 *  `/account` is the one case that does not copy a page-specific string: the
 *  live page's own `<meta name="description">` is byte-identical to
 *  `site.description`, which is production's existing fallback behaviour for
 *  a page with no description of its own — exactly the case §16.4 names the
 *  site-description fallback for. `site.description` is used here for that
 *  reason, not invented.
 */
const CUSTOM: Record<string, PageMeta> = {
  "/": { title: site.name, description: site.description },
  "/components": {
    title: "Components",
    description:
      "Composed, ready-to-use pieces built from the SevenUI primitives. Copy one into your project with a single command — the source is yours.",
  },
  "/pro": {
    title: "Pro",
    description:
      "Pre-order SevenUI Pro for $99 lifetime — the price rises to $249 once the Pro blocks catalog launches.",
  },
  "/account": { title: "Account", description: site.description },
  "/terms": {
    title: "Terms of Service",
    description:
      "The terms that govern your use of the SevenUI website, the free component registry, and SevenUI Pro.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "What personal data SevenUI collects, who processes it, and how to exercise your rights.",
  },
};

export function getPageMeta(route: string): PageMeta | undefined {
  return CUSTOM[route];
}
