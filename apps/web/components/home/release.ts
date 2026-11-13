import { RELEASES } from "../../lib/roadmap";

/**
 * The release the home page announces. The site's one version record is `RELEASES` in lib/roadmap.ts (the
 * header badge reads it too), so the home page derives its label from there and never states a number.
 */
const latest = RELEASES[0];
if (!latest) throw new Error("components/home/release.ts: lib/roadmap.ts lists no release");

/** "1.1.0" → "1.1": the home page names a release, not a patch. */
export const releaseLabel = latest.version.replace(/^(\d+\.\d+)\.0$/, "$1");

/** The release's entry on /roadmap; the anchor follows app/roadmap/page.tsx (`v1-1-0`). */
export const releaseHref = `/roadmap#v${latest.version.replaceAll(".", "-")}`;
