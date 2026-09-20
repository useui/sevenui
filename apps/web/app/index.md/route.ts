import { buildLlmsIndex } from "../../lib/site-index";

// `/index.md` — the landing page's Markdown mirror, and byte for byte
// `/llms.txt` (§15.2, verified in production: both 9,299 B).
//
// It is NOT one of the files `scripts/build-md-mirrors.ts` emits into
// `public/`, and that asymmetry is production's, reproduced. The mirror script
// renders MDX bodies; `/` has no MDX source, so Blume's `buildRawMarkdown`
// substituted `buildLlmsIndex()` for it. A route handler is therefore the only
// way to serve this path with those bytes, and the slug rule the mirrors follow
// (`route === "/" ? "index" : route.slice(1)`) is what names it `index.md`.
//
// The two endpoints share ONE generator (`lib/site-index.ts`) rather than this
// file re-deriving anything, so neither can be edited into disagreeing with
// the other.
//
// WHAT THAT DOES AND DOES NOT GUARANTEE, stated precisely because Stage 8's
// preview step `cmp`s these two bodies and would be the first thing to see it:
// the shared generator makes them identical PER GENERATION, not across time.
// These are two independent ISR entries on independent timers — each expires
// and regenerates when that path is next requested — and the generator has
// exactly one input that can change between two generations: the pro manifest
// (`blocksRoutes()`; the docs corpus is baked into the deploy and cannot move
// without one). So if the pro repo publishes a category between one
// regeneration and the other, the two bodies differ until both have been
// requested inside a 300-second window, after which they converge. Matching
// `revalidate` is what bounds that, not what removes it.
//
// Serving one path from the other's handler would remove it, and is NOT done:
// production serves `/llms.txt` as `text/plain; charset=utf-8` and `/index.md`
// as `text/markdown; charset=utf-8` (measured), which is what the two headers
// below reproduce. A rewrite would trade a transient body divergence for a
// permanent header one.
export const revalidate = 300;

export async function GET() {
  return new Response(await buildLlmsIndex(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
