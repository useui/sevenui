export interface ManifestAsset {
  type: "image" | "svg";
  src: string;
  darkSrc?: string;
}
export interface ManifestGroup {
  id: string;
  label: string;
  description: string;
  /** lucide icon kebab key, e.g. "layout-dashboard". */
  icon?: string;
}
export interface ManifestCategory {
  id: string;
  group: string;
  label: string;
  description: string;
  /** 16:9 card visual; absent falls back to /placeholder.svg. */
  cover?: ManifestAsset;
}
export interface ManifestItem {
  name: string;
  title: string;
  description: string;
  category: string;
  previewHeight: number;
}
export interface ProManifest {
  groups: ManifestGroup[];
  categories: ManifestCategory[];
  items: ManifestItem[];
}

export const kebabToPascal = (key: string) =>
  key.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

function assertAsset(asset: ManifestAsset, where: string) {
  if (asset.type !== "image" && asset.type !== "svg") {
    throw new Error(`${where}: cover.type must be "image" or "svg", got "${asset.type}"`);
  }
  for (const [field, value] of [["src", asset.src], ["darkSrc", asset.darkSrc]] as const) {
    if (value !== undefined && !/^https:\/\//.test(value)) {
      throw new Error(`${where}: cover.${field} must be an absolute https URL, got "${value}"`);
    }
  }
  if (!asset.src) throw new Error(`${where}: cover.src is required`);
}

function uniqueIds(list: { id?: string; name?: string }[], what: string) {
  const seen = new Set<string>();
  for (const entry of list) {
    const id = entry.id ?? entry.name ?? "";
    if (seen.has(id)) throw new Error(`pro manifest: duplicate ${what} "${id}"`);
    seen.add(id);
  }
  return seen;
}

export function parseManifest(raw: unknown, iconExists: (pascalKey: string) => boolean): ProManifest {
  const manifest = raw as ProManifest;
  if (!Array.isArray(manifest?.groups) || !Array.isArray(manifest?.categories) || !Array.isArray(manifest?.items)) {
    throw new Error("pro manifest: expected { groups, categories, items } arrays — is the deployed manifest enriched yet?");
  }
  if (manifest.groups.length === 0) {
    throw new Error("pro manifest: no groups — refusing to publish an empty /blocks (if intentional, coordinate a web-side change).");
  }
  const groupIds = uniqueIds(manifest.groups, "group id");
  const categoryIds = uniqueIds(manifest.categories, "category id");
  uniqueIds(manifest.items, "item name");

  for (const group of manifest.groups) {
    if (group.id === "preview") {
      throw new Error(`pro manifest: group id "preview" is reserved — rename this group.`);
    }
    if (group.icon !== undefined && !iconExists(kebabToPascal(group.icon))) {
      throw new Error(`pro manifest: unknown lucide icon key "${group.icon}"`);
    }
  }
  for (const category of manifest.categories) {
    if (!groupIds.has(category.group)) {
      throw new Error(`pro manifest: category "${category.id}" names unknown group "${category.group}"`);
    }
    if (category.cover !== undefined) assertAsset(category.cover, `category "${category.id}"`);
  }
  for (const item of manifest.items) {
    if (!categoryIds.has(item.category)) {
      throw new Error(`pro manifest: item "${item.name}" names unknown category "${item.category}"`);
    }
    if (typeof item.previewHeight !== "number" || item.previewHeight <= 0) {
      throw new Error(`pro manifest: item "${item.name}" needs a positive previewHeight`);
    }
  }
  return manifest;
}
