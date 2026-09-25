import { galleryComponents } from "./gallery";
import { site } from "./site";
import { PRO_LAUNCH, PRO_REGULAR } from "./pro-pricing";

export type PageMeta = { title: string; description: string };

const CUSTOM: Record<string, PageMeta> = {
  "/": {
    title: site.name,
    description:
      "Copy it. Own it. Ship it. React primitives built on Base UI, free components, and Pro blocks, installed with the shadcn CLI.",
  },
  "/components": {
    title: "Components",
    description:
      "Composed, ready-to-use pieces built from the SevenUI primitives. Copy one into your project with a single command — the source is yours.",
  },
  "/blocks": {
    title: "Blocks",
    description:
      "Production-ready Pro blocks for React, built on SevenUI primitives: app dashboards, auth, marketing sections, AI chat, and storefronts.",
  },
  "/pro": {
    title: "Pro",
    description:
      `SevenUI Pro at its launch price: ${PRO_LAUNCH} instead of ${PRO_REGULAR} — a lifetime license to every Pro Block, per developer.`,
  },
  "/account": {
    title: "Account",
    description: "Your SevenUI account: sign in, see your Pro licenses, and copy the license key that installs Pro blocks.",
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "The terms that govern your use of the SevenUI website, the free component registry, and SevenUI Pro.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "What personal data SevenUI collects, who processes it, and how to exercise your rights.",
  },
  "/block-request": {
    title: "Block Request",
    description:
      "Pro license holders can request a custom Block built around their use case. How to send a request and what to include.",
  },
  "/roadmap": {
    title: "Roadmap",
    description: "What is coming next to SevenUI, and what shipped in each release: primitives, components, Pro blocks, and the site.",
  },
  "/support": {
    title: "Support",
    description:
      "Get help with SevenUI: email support at mail@sevenui.dev, quick links to the docs, primitives, components, and Pro blocks, and answers to common questions.",
  },
  ...Object.fromEntries(
    galleryComponents.map((component) => [
      `/components/${component.slug}`,
      {
        title: component.label,
        description:
          `${component.count} free, copy-and-go React ${component.label} ${component.count === 1 ? "example" : "examples"} ` +
          `built on the SevenUI ${component.label} primitive. Install any of them with the shadcn CLI.`,
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
