// Build-time/runtime loader for the pro blocks manifest. The pro repo owns
// the taxonomy (groups/categories) and the catalog; this module fetches it
// under ISR and fails loudly on any shape violation — a silent fallback
// would publish an empty or wrong /blocks.
//
// `import { icons }` below pulls in lucide-react's whole ~1,800-entry icon
// record. `server-only` stops a client component from importing this module
// and accidentally shipping that whole record to the browser, defeating
// tree-shaking. The manifest's icon keys are owned by the pro repo and are
// therefore genuinely dynamic, so keeping the full record is the right
// shape server-side — it just may not cross the client boundary.
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
  // Fetched directly against the pro origin — never through this site's own
  // `/r/pro-manifest.json` rewrite (apps/web/vercel.json). A server-side
  // fetch to the site's own origin is a self-request through Vercel's edge,
  // and on a cold build the site isn't serving yet, so that path would hang
  // or fail rather than fetch.
  const source = process.env.PRO_MANIFEST_URL ?? "https://pro.sevenui.dev/r/pro-manifest.json";
  let raw: unknown;
  if (source.startsWith("http")) {
    const res = await fetch(source, {
      // Next's Data Cache is keyed by URL, so this one fetch call serves
      // all three /blocks routes *and* generateStaticParams from a single
      // cache entry — the same single-fetch property the Astro module
      // singleton (legacy-pages/blocks/_data.ts's top-level await) has
      // today. A later sitemap.xml/llms.txt/OG route reads the same entry
      // for free. 300s is the agreed SLA.
      //
      // The tag ships now; a revalidateTag webhook does not (300s already
      // meets the SLA without one) — but the tag makes that a single-file
      // addition later rather than a refactor. Facts verified against Next
      // 16.3.5's own source, transcribed here rather than re-derived:
      //   - Single-arg `revalidateTag(tag)` is deprecated in 16.3.5; it
      //     warns and points at a second argument or at `updateTag`. The
      //     call is `revalidateTag('pro-manifest', 'max')`.
      //   - `updateTag` is Server-Action-only and throws explicitly in a
      //     route handler, so a webhook must use `revalidateTag`.
      //   - The second argument changes the semantics: with no profile the
      //     tag is marked `expired: now` (hard immediate expiry — the next
      //     request re-renders and waits); with a profile it's marked
      //     `stale: now` AND `expired: now + expire`, i.e.
      //     stale-while-revalidate. The profiled form matches what /blocks
      //     already does on its window; the unprofiled form makes a new
      //     block appear on the very next request at the cost of one slow
      //     response.
      next: { revalidate: 300, tags: ["pro-manifest"] },
    });
    if (!res.ok) {
      // What this throw means under ISR (unchanged behaviour, new meaning):
      //   | When                                   | Today        | Under ISR |
      //   |----------------------------------------|--------------|-----------|
      //   | Build (generateStaticParams)            | build fails  | build fails — unchanged and wanted: a cold build has no previous good page, and publishing an empty /blocks is worse than failing |
      //   | Background revalidation                 | n/a          | the last good page keeps serving; Next retries on the next request past the window |
      //   | On-demand render of a *new* path         | n/a          | no previous version exists, so this one errors rather than serving stale |
      // A shape violation from parseManifest below is treated exactly like
      // a non-200 here — both serve stale — and it cannot be made louder at
      // the route level, because during revalidation Next keeps the last
      // good page regardless of why the render threw. "Louder" therefore
      // means an alert, which is the scheduled canary's job, not this
      // module's.
      throw new Error(`pro manifest fetch failed (${res.status}) from ${source} — /blocks cannot build without it.`);
    }
    raw = await res.json();
  } else {
    // A non-URL value is a local fixture path (dev/tests, and CI — see
    // .github/workflows/ci.yml — before pro ships). The fixture
    // (2 groups / 3 categories / 3 items) is load-bearing, not incidental:
    // CI builds against it so pull requests don't depend on pro.sevenui.dev.
    raw = JSON.parse(readFileSync(source, "utf8"));
  }
  return parseManifest(raw, (key) => key in icons);
}
