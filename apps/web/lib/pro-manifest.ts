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

// A docs deploy should not fail on a momentary pro outage, so the build retries
// network errors and 5xx/429 responses. Schema errors still fail on the spot.
const BUILD_RETRY_DELAYS_MS = [1000, 2000, 4000];

function isRetryable(status: number): boolean {
  return status >= 500 || status === 429;
}

async function fetchManifest(source: string): Promise<Response> {
  const delays = process.env.NEXT_PHASE === "phase-production-build" ? BUILD_RETRY_DELAYS_MS : [];
  for (let attempt = 0; ; attempt++) {
    let failure: string;
    try {
      const res = await fetch(source, {
        next: { revalidate: 300, tags: ["pro-manifest"] },
      });
      if (res.ok || !isRetryable(res.status)) return res;
      failure = `HTTP ${res.status}`;
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
    }
    if (attempt >= delays.length) {
      throw new Error(`pro manifest fetch failed (${failure}) from ${source} after ${attempt + 1} attempt(s)`);
    }
    console.warn(`pro manifest fetch failed (${failure}), retrying in ${delays[attempt]}ms`);
    await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
  }
}

export async function loadProManifest(): Promise<ProManifest> {
  const source = process.env.PRO_MANIFEST_URL ?? "https://pro.sevenui.dev/r/pro-manifest.json";
  let raw: unknown;
  if (source.startsWith("http")) {
    const res = await fetchManifest(source);
    if (!res.ok) {
      throw new Error(`pro manifest fetch failed (${res.status}) from ${source} — /blocks cannot build without it.`);
    }
    raw = await res.json();
  } else {
    raw = JSON.parse(readFileSync(/* turbopackIgnore: true */ source, "utf8"));
  }
  return parseManifest(raw, (key) => key in icons);
}
