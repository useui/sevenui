# 404 and redirect behaviour

Type: grilling
Status: open

## Question

Graduated from the map's **Not yet specified** by
`12-chrome-port-client-and-server-boundaries`, which settled the chrome a 404
would wear: `app/not-found.tsx` at the root, and optionally a second one inside
`app/docs` so a missed docs path renders inside the docs shell.

The facts, as sharpened by `03` and `02`:

- **`vercel.json` declares no redirects at all today** — only the five rewrites
  (`10`).
- `/docs` is a **literal route segment**, not a `basePath` (`02`), so nothing
  rewrites a path that misses the docs tree.
- The `/components` namespace is **shared**: the free gallery serves 10 live
  pages at `/components/*` while the 65 primitive pages live under
  `/docs/components/*`. So a mistyped or stale docs link can land on a real but
  wrong page instead of a 404.
- `03` found **4 base-relative markdown links in 3 MDX files** that Blume
  rewrites through `basePath` and that `02`'s no-`basePath` decision leaves
  pointing into the gallery's occupied namespace.
- `08` found the six `search.popular` routes are base-less, and
  `/components/button` unprefixed lands on a real but wrong gallery page.

Settle:

1. **What does the root 404 render?** Blume ships one today; measure it first,
   then decide whether the port reproduces it or writes its own.
2. **Does the docs segment get its own `not-found`,** rendering inside the docs
   chrome (sidebar, header) rather than as a bare page?
3. **Are any redirects declared, and where?** The candidates are the four broken
   MDX links (`03`) and anything the cutover itself strands. `vercel.json` is the
   rewrites' single owner (`10`); a redirect could live there or in
   `next.config`, and that ownership question is the same one `10` answered for
   rewrites.
4. **Do the four broken links get fixed at the source instead?** They are MDX
   authored in this repo, so editing them is cheaper than a redirect — but only
   if no external site links to the same wrong shape.
5. **Does a 404 route report a 404 status**, and is that verified? A Next.js
   `not-found.tsx` does, but a catch-all that renders a fallback page instead
   returns 200 — which is what makes a stale link silently look fine to a
   crawler.
6. **Is the shared `/components` namespace left as it is?** The map has already
   ruled a `/primitives` rename out of scope twice; this ticket only decides
   what happens to a path that misses, not the naming.

## Update from `15-agent-facing-and-seo-surface`

`03`'s four base-relative Markdown links reach the **agent artefacts** in the
same broken shape — Blume rewrites relative *images* only, so nothing touches
them on the way into `/<route>.md` and `llms-full.txt`. That widens this
ticket's question 4: fixing them at the MDX source repairs all three surfaces at
once, while a redirect repairs only the HTML one.

## Update from `16-og-card-reproduce-or-redraw`

`16` decided the `/og/[...slug]` route's own miss behaviour and this ticket does
**not** need to re-open it: an unrecognised slug is looked up in
`lib/page-meta.ts` and `notFound()`s. That is parity (a missing file 404s in
today's static build) and it is load-bearing rather than cosmetic — `16` runs the
route with `dynamicParams: true` so new block categories get cards, which without
the lookup would make `/og/<anything>.png` render caller-chosen text on a card
that looks like ours.

What this ticket still owns is unchanged: the root and docs `not-found`, the four
base-relative MDX links, and whether a miss reports a real 404 status. One data
point for question 5 — the OG route is the one place on the site where "returns
200 with a plausible-looking fallback instead of 404" was a live option, and it
was declined.
