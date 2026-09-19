// Shared data for the /components gallery: the index grid and every
// per-component page's sidebar read from here.
import componentsRegistry from "../../../../packages/registry/components/registry.json";
import mainRegistry from "../../../../packages/registry/registry.json";

export interface GalleryComponent {
  slug: string;
  label: string;
  count: number;
}

const uiTitles = new Map(
  mainRegistry.items
    .filter((item) => item.type === "registry:ui")
    .map((item) => [item.name, item.title]),
);

const counts = new Map<string, number>();
for (const item of componentsRegistry.items) {
  const slug = item.files[0].path.split("/")[0];
  counts.set(slug, (counts.get(slug) ?? 0) + 1);
}

export const galleryComponents: GalleryComponent[] = [...counts.entries()]
  .map(([slug, count]) => {
    const label = uiTitles.get(slug);
    if (!label) {
      throw new Error(
        `components/${slug} has no matching registry:ui item — gallery folders must be named after a ui component.`,
      );
    }
    return { slug, label, count };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

// Every gallery component must have a page, or the sidebar renders a dead
// link. Pages are static files (Astro islands need literal imports), so a
// new content folder always ships with its page.
const pages = new Set(
  Object.keys(import.meta.glob("./*.astro")).map((path) =>
    path.replace("./", "").replace(".astro", ""),
  ),
);
const missing = galleryComponents.filter((c) => !pages.has(c.slug)).map((c) => c.slug);
if (missing.length > 0) {
  throw new Error(
    `components folder(s) ${missing.join(", ")} have no page in apps/web/pages/components/ — add <slug>.astro.`,
  );
}

/** Look up a gallery component's data, or fail loudly if the page/folder pairing is broken. */
export function galleryComponent(slug: string): GalleryComponent {
  const component = galleryComponents.find((c) => c.slug === slug);
  if (!component) {
    throw new Error(
      `/components/${slug}: no gallery data — the page exists but packages/registry/components/${slug} has no items.`,
    );
  }
  return component;
}
