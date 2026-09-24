import { galleryComponents } from "./gallery";
import { site } from "./site";

export type PageMeta = { title: string; description: string };

const CUSTOM: Record<string, PageMeta> = {
  "/": { title: site.name, description: site.description },
  "/components": {
    title: "Components",
    description:
      "Composed, ready-to-use pieces built from the SevenUI primitives. Copy one into your project with a single command — the source is yours.",
  },
  "/blocks": {
    title: "Blocks",
    description: "Production-ready pro blocks built on SevenUI components.",
  },
  "/pro": {
    title: "Pro",
    description:
      "SevenUI Pro at its launch price: $99 instead of $249 — a lifetime license to every Pro Block, per developer.",
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
  ...Object.fromEntries(
    galleryComponents.map((component) => [
      `/components/${component.slug}`,
      {
        title: component.label,
        description: `Free, copy-and-go ${component.label} components built on the SevenUI ${component.label} primitive.`,
      },
    ]),
  ),
};

export async function getPageMeta(route: string): Promise<PageMeta | undefined> {
  const custom = CUSTOM[route];
  if (custom) return custom;

  if (route === "/docs" || route.startsWith("/docs/")) {
    const { getDoc } = await import("./docs");
    const doc = await getDoc(route);
    if (!doc) return undefined;
    return { title: doc.title, description: doc.description };
  }

  if (route.startsWith("/blocks/")) {
    const { loadBlocksTree } = await import("./blocks");
    const [groupId, categoryId, ...rest] = route.slice("/blocks/".length).split("/");
    if (rest.length > 0 || !groupId) return undefined;
    if (categoryId === "") return undefined;
    const groups = await loadBlocksTree();
    const group = groups.find((entry) => entry.id === groupId);
    if (!group) return undefined;
    if (categoryId === undefined) return { title: `${group.label} blocks`, description: group.description };
    const category = group.categories.find((entry) => entry.id === categoryId);
    if (!category) return undefined;
    return { title: `${category.label} blocks`, description: category.description };
  }

  return undefined;
}

export async function requirePageMeta(route: string, file: string): Promise<PageMeta> {
  const meta = await getPageMeta(route);
  if (!meta) {
    throw new Error(`${file}: no page-meta registered for route "${route}"`);
  }
  return meta;
}

export const CUSTOM_ROUTES: ReadonlySet<string> = new Set(Object.keys(CUSTOM));
