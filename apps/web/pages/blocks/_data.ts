// Shared data for the blocks gallery: the category directory (`index.astro`),
// per-group pages (`[group]/index.astro`), and per-category pages
// (`[group]/[category].astro`) all read from here so the taxonomy, preview
// heights, and registry matching stay in one place.
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

export interface CategoryDefinition {
  id: string;
  label: string;
  description: string;
  match: (name: string) => boolean;
}

export interface GroupDefinition {
  id: string;
  label: string;
  description: string;
  categories: CategoryDefinition[];
}

export interface Category extends CategoryDefinition {
  items: RegistryItem[];
}

export interface Group extends Omit<GroupDefinition, "categories"> {
  categories: Category[];
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

// How the preview route stages each block. Blocks ship without any stage
// wrapper — the installed source is the component alone — so the framing
// that used to be baked into the block source lives here, applied only
// inside the preview iframe (where svh equals the iframe height).
// "centered": narrow blocks (cards) centered in the frame with padding.
// "filled": full-width blocks; the stage guarantees frame height and
// vertically centers content shorter than the frame (split-screens carry
// their own min-h-svh and simply fill it).
export type PreviewStage = "centered" | "filled";

export const PREVIEW_STAGES: Record<string, PreviewStage> = {
  "login-01": "centered",
  "login-02": "filled",
  "login-03": "centered",
  "signup-01": "centered",
  "signup-02": "filled",
  "hero-01": "filled",
  "hero-02": "filled",
  "pricing-01": "filled",
  "pricing-02": "filled",
};

// Every block must declare how the preview stages it — a missing entry
// would silently fall back and render a card block un-centered.
const unstaged = (blocksRegistry.items as RegistryItem[])
  .filter((item) => !(item.name in PREVIEW_STAGES))
  .map((item) => item.name);
if (unstaged.length > 0) {
  throw new Error(
    `Blocks registry item(s) ${unstaged.map((name) => `"${name}"`).join(", ")} have no PREVIEW_STAGES entry in apps/web/pages/blocks/_data.ts.`,
  );
}

export const GROUPS: GroupDefinition[] = [
  {
    id: "application",
    label: "Application",
    description: "Blocks for product interfaces.",
    categories: [
      {
        id: "auth",
        label: "Auth",
        description: "Login and signup flows.",
        match: (name: string) => name.startsWith("login") || name.startsWith("signup"),
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Blocks for landing and marketing pages.",
    categories: [
      {
        id: "hero",
        label: "Hero",
        description: "Opening sections that sell the product.",
        match: (name: string) => name.startsWith("hero"),
      },
      {
        id: "pricing",
        label: "Pricing",
        description: "Plans and billing sections.",
        match: (name: string) => name.startsWith("pricing"),
      },
    ],
  },
];

// "preview" is a static route segment (/blocks/preview/[slug].astro) — a
// group with this id would be shadowed by it and never render. Nested
// category URLs live under /blocks/<group>/<category>, so only the group
// level can collide with the static preview segment.
for (const group of GROUPS) {
  if (group.id === "preview") {
    throw new Error(
      `Blocks group id "preview" is reserved (shadowed by the /blocks/preview/ route) — rename this group.`,
    );
  }
}

// Duplicate group ids, or duplicate category ids within a group, would
// silently shadow one another's routes. Fail the build instead.
const seenGroupIds = new Set<string>();
for (const group of GROUPS) {
  if (seenGroupIds.has(group.id)) {
    throw new Error(
      `Duplicate blocks group id "${group.id}" in apps/web/pages/blocks/_data.ts — group ids must be unique.`,
    );
  }
  seenGroupIds.add(group.id);

  const seenCategoryIds = new Set<string>();
  for (const category of group.categories) {
    if (seenCategoryIds.has(category.id)) {
      throw new Error(
        `Duplicate blocks category id "${category.id}" in group "${group.id}" in apps/web/pages/blocks/_data.ts — category ids must be unique within a group.`,
      );
    }
    seenCategoryIds.add(category.id);
  }
}

export const groups: Group[] = GROUPS.map((group) => {
  const categories: Category[] = group.categories.map((category) => ({
    ...category,
    items: (blocksRegistry.items as RegistryItem[]).filter((item) => category.match(item.name)),
  }));
  return {
    ...group,
    categories,
    items: categories.flatMap((category) => category.items),
  };
});

// Every registry item must land in exactly one category, or it silently
// disappears from the gallery. Fail the build instead, naming every
// unmatched item so a broad regression (e.g. a whole category's match()
// going stale) isn't reported one item at a time.
const categorized = new Set(groups.flatMap((group) => group.items.map((item) => item.name)));
const uncategorized = (blocksRegistry.items as RegistryItem[])
  .filter((item) => !categorized.has(item.name))
  .map((item) => item.name);
if (uncategorized.length > 0) {
  throw new Error(
    `Blocks registry item(s) ${uncategorized.map((name) => `"${name}"`).join(", ")} do not match any category in apps/web/pages/blocks/_data.ts — add a matching category or update an existing match().`,
  );
}
