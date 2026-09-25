import "server-only";

import componentsRegistry from "../../../packages/registry/components/registry.json";
import mainRegistry from "../../../packages/registry/registry.json";

export interface GalleryComponent {
  slug: string;
  label: string;
  count: number;
}

export interface GalleryExample {
  /** Registry item name; also the anchor id, e.g. "accordion-01". */
  id: string;
  title: string;
  description: string;
}

export const GALLERY_SLUGS = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "attachment",
  "avatar",
  "badge",
  "breadcrumb",
  "bubble",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "empty",
  "field",
  "form",
  "hover-card",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "marker",
  "menubar",
  "message",
  "message-scroller",
  "meter",
  "native-select",
  "navigation-menu",
  "number-field",
  "pagination",
  "popover",
  "progress",
  "questionnaire",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "toolbar",
  "tooltip",
] as const;

export type GallerySlug = (typeof GALLERY_SLUGS)[number];

const uiTitles = new Map(
  mainRegistry.items.filter((item) => item.type === "registry:ui").map((item) => [item.name, item.title]),
);

const examplesBySlug = new Map<string, GalleryExample[]>();
for (const item of componentsRegistry.items) {
  const slug = item.files[0].path.split("/")[0];
  const list = examplesBySlug.get(slug);
  const example = { id: item.name, title: item.title, description: item.description };
  if (list) list.push(example);
  else examplesBySlug.set(slug, [example]);
}

export const galleryComponents: GalleryComponent[] = [...examplesBySlug.entries()]
  .map(([slug, examples]) => {
    const label = uiTitles.get(slug);
    if (!label) {
      throw new Error(
        `components/${slug} has no matching registry:ui item — gallery folders must be named after a ui component.`,
      );
    }
    return { slug, label, count: examples.length };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

{
  const derived = galleryComponents.map((component) => component.slug);
  const pinned = [...GALLERY_SLUGS].sort((a, b) => a.localeCompare(b));
  if (derived.join(",") !== pinned.join(",")) {
    const missingPages = derived.filter((slug) => !pinned.includes(slug as GallerySlug));
    const missingFolders = pinned.filter((slug) => !derived.includes(slug));
    throw new Error(
      "lib/gallery.ts: GALLERY_SLUGS and packages/registry/components/registry.json disagree. " +
        (missingPages.length
          ? `Registry folder(s) with no gallery page: ${missingPages.join(", ")} — add them to GALLERY_SLUGS. `
          : "") +
        (missingFolders.length
          ? `GALLERY_SLUGS entr(ies) with no registry folder: ${missingFolders.join(", ")} — the route would 404. `
          : ""),
    );
  }
}

/** Look up a gallery component, or fail loudly if the pairing is broken. */
export function galleryComponent(slug: string): GalleryComponent {
  const component = galleryComponents.find((candidate) => candidate.slug === slug);
  if (!component) {
    throw new Error(
      `/components/${slug}: no gallery data — the route exists but packages/registry/components/${slug} has no items.`,
    );
  }
  return component;
}

/** The examples one gallery page renders, in registry order. */
export function galleryExamples(slug: string): GalleryExample[] {
  const examples = examplesBySlug.get(slug);
  if (!examples) {
    throw new Error(
      `/components/${slug}: no gallery examples — the route exists but packages/registry/components/${slug} has no items.`,
    );
  }
  return examples;
}
