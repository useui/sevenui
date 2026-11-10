/**
 * The header's information architecture: four top-level entries instead of eight tabs. The three libraries
 * (primitives, components, blocks) share one Library menu, and the pages about the project share Resources.
 * Plain data, safe on both sides of the server/client boundary; the counts arrive as `HeaderNav`.
 */

export type NavEntry = { label: string; href: string; count?: number };

/** What the server knows about the libraries when it renders the header. Blocks load later, on demand. */
export type HeaderNav = {
  primitives: { href: string; count: number; picks: NavEntry[] };
  components: { count: number; families: NavEntry[] };
  /** The latest release, as on /roadmap. */
  version: string;
};

/** The primitives shown by name in the Library menu, in this order, when the docs carry them. */
export const PRIMITIVE_PICKS = ["button", "input", "select", "combobox", "dialog", "dropdown-menu", "tabs", "tooltip"] as const;

/** The primitive the Library menu introduces in its feature card. */
export const FEATURED_PRIMITIVE = {
  label: "Layer Card",
  href: "/docs/components/layer-card",
  description: "A tray with raised panels inside, the card this site is built from.",
} as const;

export type ResourceLink = { label: string; href: string; description: string; icon: "roadmap" | "request" | "support" };

export const RESOURCES: ResourceLink[] = [
  { label: "Roadmap", href: "/roadmap", description: "What ships next, and what shipped in each release.", icon: "roadmap" },
  { label: "Block Request", href: "/block-request", description: "Pro license holders can ask for a custom block.", icon: "request" },
  { label: "Support", href: "/support", description: "Email support, quick links, and common answers.", icon: "support" },
];

/** Plain-text indexes of the site for coding agents, served by app/llms*.txt. */
export const AGENT_LINKS: { label: string; href: string; description: string }[] = [
  { label: "llms.txt", href: "/llms.txt", description: "Every page, indexed" },
  { label: "llms-full.txt", href: "/llms-full.txt", description: "The full docs in one file" },
];

export type HeaderSection = "docs" | "library" | "pro" | "resources";

const LIBRARY_PREFIXES = ["/docs/components", "/components", "/blocks"];

function under(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Which top-level header entry the current page belongs to. */
export function headerSectionFor(pathname: string): HeaderSection | undefined {
  if (LIBRARY_PREFIXES.some((prefix) => under(pathname, prefix))) return "library";
  if (under(pathname, "/docs")) return "docs";
  if (under(pathname, "/pro")) return "pro";
  if (RESOURCES.some((resource) => under(pathname, resource.href))) return "resources";
  return undefined;
}

export function isUnder(pathname: string, prefix: string): boolean {
  return under(pathname, prefix);
}
