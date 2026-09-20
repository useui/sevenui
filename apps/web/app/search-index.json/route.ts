import { NextResponse } from "next/server";

import { buildSearchIndex } from "../../lib/docs/search-index";

// This is build output, like `public/r/` — not a hand-authored artifact and
// not a checked-in file. `force-static` tells Next this handler reads no
// per-request input (no `cookies()`, no `headers()`, no `searchParams`), so
// it can run once during `next build` and be served as a static file from
// then on, exactly like a page under `output: "export"`. `/blocks`
// deliberately does NOT get this treatment (§9 Step 3, §10) because it is
// ISR-revalidated and a build-time snapshot of a revalidating collection is
// stale by construction; the docs corpus has no such collection behind it —
// it is a filesystem read baked into the deploy — so static is the correct
// choice here, not a shortcut taken for the same reason `/blocks` cannot.
export const dynamic = "force-static";

export async function GET() {
  const index = await buildSearchIndex();
  return NextResponse.json(index);
}
