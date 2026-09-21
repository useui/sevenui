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
];

// §9 Step 3: "12 results shown, as today."
export const SEARCH_RESULT_LIMIT = 12;

export const SEARCH_INDEX_URL = "/search-index.json";
