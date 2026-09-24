export type SearchEntry = {
  route: string;
  hash?: string;
  title: string;
  pageTitle?: string;
  description?: string;
  body?: string;
  section: string;
};

export type PopularLink = { href: string; label: string };

export const POPULAR: PopularLink[] = [
  { href: "/docs/installation", label: "Installation" },
  { href: "/docs/theming", label: "Theming" },
  { href: "/docs/components/button", label: "Button" },
  { href: "/docs/components/dialog", label: "Dialog" },
  { href: "/docs/components/combobox", label: "Combobox" },
  { href: "/docs/components/toast", label: "Toast" },
  { href: "/blocks", label: "Blocks" },
  { href: "/pro", label: "Pro" },
];

/**
 * Section labels outside the docs nav. Docs pages take their section from the
 * nav tree ("Docs", "Primitives"); everything else in the index uses one of these.
 */
export const SITE_SECTIONS = {
  components: "Components",
  blocks: "Blocks",
  pages: "Pages",
} as const;

/** The order the palette's section pills follow — the header tab order, then the loose pages. */
export const SECTION_ORDER: readonly string[] = [
  "Docs",
  "Primitives",
  SITE_SECTIONS.components,
  SITE_SECTIONS.blocks,
  SITE_SECTIONS.pages,
];

// §9 Step 3: "12 results shown, as today."
export const SEARCH_RESULT_LIMIT = 12;

export const SEARCH_INDEX_URL = "/search-index.json";
