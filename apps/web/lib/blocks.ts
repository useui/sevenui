// Shared data for the /blocks pro gallery. The taxonomy and the catalog are
// owned by the pro repo and arrive through `lib/pro-manifest.ts`; this module
// does exactly one thing on top of that — it joins the manifest's three flat
// arrays into the group -> category -> items tree the three /blocks pages and
// the category sidebar render. Ported from `legacy-pages/blocks/_data.ts`,
// whose filter/map shape and exported types are reproduced here unchanged.
//
// ONE SHAPE CHANGE, FORCED BY THE PLATFORM. Astro evaluated
// `const manifest = await loadProManifest()` at MODULE SCOPE — a top-level
// await in a module instantiated exactly once per build, so the whole site got
// one fetch and one frozen snapshot, which is correct when the snapshot only
// has to survive a build. Under ISR it is wrong: the module lives for the life
// of the server process, so a module-scope value would be pinned to whatever
// the first render saw and the 300-second revalidation window could never
// refresh it. No amount of `revalidate` on the route fixes that, because the
// route would re-render against the same stale module binding. So this module
// exports an async FUNCTION and calls `loadProManifest()` per render instead.
//
// The property the module singleton used to provide — one fetch for the whole
// section, not one per page — is NOT lost, and this is the non-obvious part:
// it is now provided by Next's Data Cache, which is keyed by URL, NOT by a
// module singleton. Every caller in a render pass (the directory page, the
// group page, the category page, `generateStaticParams`, the sidebar) calls
// `loadProManifest()` and they all hit the same single cache entry; the
// network is touched at most once per 300-second window. Do not "optimise"
// this back into a module-level promise — that would re-freeze it.
//
// `import "server-only"` is enforcement, not decoration. This module imports
// `lib/pro-manifest.ts`, which pulls lucide-react's ~1,800-entry `icons`
// record (see that file's header). `lib/gallery.ts` is the precedent and the
// rule is the same: a client component may `import type` from here, because
// type imports are erased before any bundler sees them, but never a value.
import "server-only";
import {
  loadProManifest,
  type ManifestCategory,
  type ManifestGroup,
  type ManifestItem,
} from "./pro-manifest";

export type { ManifestItem };

export interface Category extends ManifestCategory {
  items: ManifestItem[];
}

export interface Group extends ManifestGroup {
  categories: Category[];
  items: ManifestItem[];
}

/**
 * The joined group -> category -> items tree, freshly derived from the
 * manifest on every call. Cheap: the fetch is deduped by the Data Cache (see
 * the file header) and the join is three array passes over a ~140-entry
 * manifest, so calling this once per page and once more for the sidebar costs
 * nothing worth caching.
 */
export async function loadBlocksTree(): Promise<Group[]> {
  const manifest = await loadProManifest();
  return manifest.groups.map((group) => {
    const categories: Category[] = manifest.categories
      // The manifest's identifiers are `id`, and a category names its parent
      // through `category.group`. There is no `slug` anywhere in this schema.
      .filter((category) => category.group === group.id)
      .map((category) => ({
        ...category,
        items: manifest.items.filter((item) => item.category === category.id),
      }));
    return { ...group, categories, items: categories.flatMap((category) => category.items) };
  });
}
