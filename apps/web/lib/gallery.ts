import "server-only";

import componentsRegistry from "../../../packages/registry/components/registry.json";
import mainRegistry from "../../../packages/registry/registry.json";

/**
 * The `/components` gallery's data, ported from
 * `legacy-pages/components/_data.ts`. Two registries answer three questions:
 * `packages/registry/components/registry.json` supplies the examples (which
 * folder, which item, what it is called), and the ROOT
 * `packages/registry/registry.json` supplies the human-readable label of the
 * `registry:ui` primitive each folder is named after.
 *
 * `import "server-only"` (line 1) is the enforcement, not the docstring:
 * this module is imported for its VALUES by `app/layout.tsx`, both gallery
 * route files, the gallery layout and `lib/page-meta.ts`, all server
 * components, and a client component importing any of those values would
 * otherwise pull both registry JSON files into the client bundle silently.
 * Now it is a build error instead. The two client components that need this
 * module (`components/gallery/nav.tsx`, `components/site-drawer.tsx`) use
 * `import type` for the interfaces below, which is erased before any
 * bundler sees it and is unaffected by the guard.
 */
export interface GalleryComponent {
  slug: string;
  label: string;
  count: number;
}

export interface GalleryExample {
  /** Registry item name; also the anchor id, e.g. "accordion-01". */
  id: string;
  title: string;
}

/**
 * The page set, pinned. Adding a registry item does NOT add a route — that
 * is reproduced behaviour, not an oversight: the 10 pages were hand-written
 * `.astro` files, so a new content folder could ship without one and
 * `_data.ts` threw at build time when it did.
 *
 * `app/components/[name]/page.tsx` returns exactly this list from
 * `generateStaticParams` and sets `dynamicParams = false`, so the route set
 * is this constant and nothing else. The assertion below is the other half
 * of what `_data.ts` did with `import.meta.glob("./*.astro")`: it fails the
 * build when this list and the registry's own folder set disagree, in
 * EITHER direction.
 */
export const GALLERY_SLUGS = [
  "accordion",
  "badge",
  "button",
  "card",
  "dialog",
  "dropdown-menu",
  "input",
  "select",
  "switch",
  "tabs",
] as const;

export type GallerySlug = (typeof GALLERY_SLUGS)[number];

const uiTitles = new Map(
  mainRegistry.items.filter((item) => item.type === "registry:ui").map((item) => [item.name, item.title]),
);

// Grouped by the first path segment of each item's first file, exactly as
// `_data.ts` derived it. Insertion order follows the registry file, which is
// also the order the 10 `.astro` pages listed their examples in — verified
// item-for-item (id, title AND position) against all 40 `<ExampleCard>` tags
// before this module replaced them.
const examplesBySlug = new Map<string, GalleryExample[]>();
for (const item of componentsRegistry.items) {
  const slug = item.files[0].path.split("/")[0];
  const list = examplesBySlug.get(slug);
  const example = { id: item.name, title: item.title };
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

// The build-time pairing check, run on module evaluation. `_data.ts` threw
// when a content folder had no `<slug>.astro`; a dynamic segment inverts the
// failure mode (an unlisted folder would silently have no page, a listed slug
// with no folder would 404 at request time), so both directions are checked
// against the pinned list here.
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
