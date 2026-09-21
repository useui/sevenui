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

export async function loadBlocksTree(): Promise<Group[]> {
  const manifest = await loadProManifest();
  return manifest.groups.map((group) => {
    const categories: Category[] = manifest.categories
      .filter((category) => category.group === group.id)
      .map((category) => ({
        ...category,
        items: manifest.items.filter((item) => item.category === category.id),
      }));
    return { ...group, categories, items: categories.flatMap((category) => category.items) };
  });
}
