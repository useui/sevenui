import "server-only";
import { readFileSync } from "node:fs";
import { icons } from "lucide-react";
import {
  kebabToPascal,
  parseManifest,
  type ManifestAsset,
  type ManifestCategory,
  type ManifestGroup,
  type ManifestItem,
  type ProManifest,
} from "./pro-manifest-schema";

export type { ManifestAsset, ManifestCategory, ManifestGroup, ManifestItem, ProManifest };
export { parseManifest };

/** Resolve a manifest icon key to its lucide-react component. */
export function lucideIcon(key: string) {
  const icon = (icons as Record<string, unknown>)[kebabToPascal(key)];
  if (!icon) {
    throw new Error(`pro manifest: unknown lucide icon key "${key}"`);
  }
  return icon as (props: Record<string, unknown>) => unknown;
}

export async function loadProManifest(): Promise<ProManifest> {
  const source = process.env.PRO_MANIFEST_URL ?? "https://pro.sevenui.dev/r/pro-manifest.json";
  let raw: unknown;
  if (source.startsWith("http")) {
    const res = await fetch(source, {
      next: { revalidate: 300, tags: ["pro-manifest"] },
    });
    if (!res.ok) {
      throw new Error(`pro manifest fetch failed (${res.status}) from ${source} — /blocks cannot build without it.`);
    }
    raw = await res.json();
  } else {
    raw = JSON.parse(readFileSync(/* turbopackIgnore: true */ source, "utf8"));
  }
  return parseManifest(raw, (key) => key in icons);
}
