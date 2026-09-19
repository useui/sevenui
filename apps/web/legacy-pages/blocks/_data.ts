// Shared data for the /blocks pro gallery. The taxonomy and catalog come
// from the pro manifest at build time (see lib/pro-manifest.ts); this
// module only joins them into the group→category→items tree the pages
// and sidebar render.
import {
  loadProManifest,
  type ManifestCategory,
  type ManifestGroup,
  type ManifestItem,
} from "../../lib/pro-manifest";

export type { ManifestItem };
export interface Category extends ManifestCategory {
  items: ManifestItem[];
}
export interface Group extends ManifestGroup {
  categories: Category[];
  items: ManifestItem[];
}

const manifest = await loadProManifest();

export const groups: Group[] = manifest.groups.map((group) => {
  const categories: Category[] = manifest.categories
    .filter((category) => category.group === group.id)
    .map((category) => ({
      ...category,
      items: manifest.items.filter((item) => item.category === category.id),
    }));
  return { ...group, categories, items: categories.flatMap((category) => category.items) };
});
