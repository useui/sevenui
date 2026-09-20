import { buildLlmsIndex } from "../../lib/site-index";

// `/llms.txt` (§15.4). The generator lives in `lib/site-index.ts` because
// `/index.md` returns the identical bytes (§15.2) and the two must never be
// able to drift; this handler is the transport and nothing else.
//
// ISR, not `force-static` like `/search-index.json` beside it, and the
// difference is the manifest: this file lists every `/blocks` route, and that
// list is owned by the pro repo. A build-time snapshot of a revalidating
// collection is stale by construction — the same reasoning `app/blocks` uses.
// 300 seconds matches `lib/pro-manifest.ts`'s own `next.revalidate` and §15.7's
// site-wide ceiling ("no `revalidate` anywhere exceeds 300 seconds"), so this
// route introduces no second number, and it shares the manifest fetch with
// `sitemap.ts` through the URL-keyed Data Cache rather than making its own.
export const revalidate = 300;

export async function GET() {
  return new Response(await buildLlmsIndex(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
