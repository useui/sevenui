// Shared data for the blocks gallery: the category directory (`index.astro`)
// and per-category pages (`[category].astro`) both read from here so the
// category list, preview heights, and registry matching stay in one place.
import blocksRegistry from "../../../../packages/blocks/registry.json";

export interface RegistryFile {
  path: string;
  type: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title: string;
  description: string;
  registryDependencies?: string[];
  files: RegistryFile[];
}

export interface Category {
  id: string;
  label: string;
  description: string;
  match: (name: string) => boolean;
}

export interface Section extends Category {
  items: RegistryItem[];
}

export const PREVIEW_HEIGHTS: Record<string, number> = {
  "login-01": 560,
  "login-02": 640,
  "login-03": 560,
  "signup-01": 640,
  "signup-02": 640,
  "hero-01": 480,
  "hero-02": 480,
  "pricing-01": 720,
  "pricing-02": 760,
};

export const CATEGORIES: Category[] = [
  {
    id: "auth",
    label: "Authentication",
    description: "Login and signup flows",
    match: (name: string) => name.startsWith("login") || name.startsWith("signup"),
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Heroes and pricing sections",
    match: (name: string) => name.startsWith("hero") || name.startsWith("pricing"),
  },
];

// "preview" is a static route segment (/blocks/preview/[slug].astro) — a
// category with this id would be shadowed by it and never render.
for (const category of CATEGORIES) {
  if (category.id === "preview") {
    throw new Error(
      `Blocks category id "preview" is reserved (shadowed by the /blocks/preview/ route) — rename this category.`,
    );
  }
}

export const sections: Section[] = CATEGORIES.map((category) => ({
  ...category,
  items: (blocksRegistry.items as RegistryItem[]).filter((item) => category.match(item.name)),
}));

// Every registry item must land in exactly one category, or it silently
// disappears from the gallery. Fail the build instead.
const categorized = new Set(sections.flatMap((section) => section.items.map((item) => item.name)));
for (const item of blocksRegistry.items as RegistryItem[]) {
  if (!categorized.has(item.name)) {
    throw new Error(
      `Blocks registry item "${item.name}" does not match any category in apps/web/pages/blocks/_data.ts — add a matching category or update an existing match().`,
    );
  }
}
