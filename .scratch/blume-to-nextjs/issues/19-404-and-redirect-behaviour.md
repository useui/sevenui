# 404 and redirect behaviour

Type: grilling
Status: resolved

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

## Answer

Resolved 2026-09-19. Blume's `notFoundPageTemplate` was read from source
(`…/blume/src/astro/templates.ts:2313`) and every claim below was verified
against the live site rather than inferred.

### Premise corrections

1. **The four MDX links do not land on a wrong page — they 404.** The gallery
   namespace holds exactly 10 pages (`accordion`, `badge`, `button`, `card`,
   `dialog`, `dropdown-menu`, `input`, `select`, `switch`, `tabs`); neither
   `field` nor `form` is among them. Verified live: `/components/field` 404,
   `/components/form` 404, `/installation` 404. The ticket's "real but wrong
   page" framing does not apply to any of the four.

2. **The genuinely dangerous collisions belong to `08`, and `08` already closed
   them.** `/components/button` and `/components/dialog` both return 200 on the
   wrong page, but they are `search.popular` entries, and `08` decision 6 moves
   all six to `lib/docs/search.ts` with literal `/docs/` prefixes, handed to
   `14`. This ticket does not own them.

3. **The live 404 is chrome-orphaned.** It renders Blume's *default* header —
   logo plus GitHub only — because the generated `404.astro` never receives the
   `layout={{ Header }}` override the six custom pages pass (`12`'s second patch
   hunk). Measured against the landing page: 7,565 B / 2 links versus 9,882 B /
   8 links, and zero `<nav>` elements. The site's five tabs and the account link
   are absent, so the page is a dead end with one button out.

4. **Status codes are already correct and need no work.** Every miss probed
   returns 404 with the same 21,026 B page: root, `/docs/*`, `/docs/components/*`,
   `/components/*`, `/blocks/*`, `/blocks/<group>/*`, `/og/*`. Astro emits
   `404.html` at the output root and Vercel serves it with a 404 status.

### Decisions

1. **Root 404: content reproduced verbatim, chrome upgraded for free.** The 6xl
   muted "404", the `Page not found` h1, "We couldn't find the page you're
   looking for.", and an accent button to `/` are kept exactly. `app/not-found.tsx`
   sits under the root layout, so the real header arrives without being asked
   for — correcting premise 3 as a side effect of the port's structure rather
   than as work. `noindex` must be emitted **explicitly**: Blume sets it, and
   Next does not add it to `not-found.tsx` automatically.

   The `<title>` gains the suffix: **"Page not found — SevenUI"**. `15` set that
   rule over the 85 live routes and the 404 sat outside that audit, but a rule
   with an exceptions list stops being a rule. One intended-diff line for `13`.

2. **Two `not-found` boundaries: root and docs.** `app/docs/not-found.tsx`
   renders inside the docs layout, so a miss arrives with the sidebar — the only
   thing on the site that lists all 65 primitives, and the actual recovery
   affordance for what a docs miss overwhelmingly is (a mistyped or stale
   primitive slug). Today's bare page offers nothing. The sidebar renders with
   no active item, which under `03`'s one-way group force simply means no group
   is opened.

   Boundaries for the gallery and `/blocks` are **declined**: 10 static pages and
   a manifest-driven category set respectively, where a sidebar's recovery value
   is low, while each extra `not-found.tsx` is one more surface `13` must verify.

3. **The four MDX links are fixed at source, shipped to `main` before the
   cutover.** The corpus already writes **41** internal links with a literal
   `/docs/` prefix against these **4** without one, so the four are an
   inconsistency, not a convention. Blume's rewrite is **idempotent** — verified
   on the live `field` page, where `](/docs/components/label)` renders as
   `/docs/components/label` (not double-prefixed) while `](/components/form)`
   renders as `/docs/components/form` — so rewriting the four at source produces
   **byte-identical HTML today**.

   That is what makes it the better tool than a redirect: it repairs all three
   surfaces at once (HTML, `/<route>.md`, `llms-full.txt`, which currently
   carries 3 occurrences of `](/components/`), where a redirect would repair only
   the first. Same pre-ship pattern as `15`'s gallery titles and `16`'s
   `seo.og.titles`. The four are `docs/index.mdx:53,56` and
   `docs/components/form.mdx:39`, `docs/components/field.mdx:55`.

4. **No redirects are declared; `vercel.json` stays rewrite-only.**
   `/installation` and `/theming` have 404'd ever since the `/docs` base path
   landed in Wave 2, so a redirect now is a new feature rather than parity — added
   during a cutover whose entire point is that regressions stay attributable. A
   blanket rule for `/components/*` is impossible anyway, because the gallery
   occupies that namespace; what remains is per-path mappings, which is a
   maintenance trap. Nothing external can be linking to a working
   `/components/field` or `/components/form`, because neither was ever a valid URL
   on this site. `10`'s "`vercel.json` is the rewrites' single owner" is untouched.

5. **A fixed negative-path list joins `13`'s sweep.** `13`'s inventory is an
   inventory of *live* routes and cannot see a miss. The risk here is the inverse
   of the usual one: `02`'s `[[...slug]]` catch-all and `09`'s `dynamicParams`
   both make it easy to accidentally return **200 with a plausible fallback**,
   which is exactly what makes a stale link look healthy to a crawler. Six paths,
   each asserted 404: a docs miss, a gallery miss, a blocks category miss (`09`'s
   `notFound()`), an OG miss (`16`'s registry lookup), a root miss, and
   `/components/field` — the last proving decision 3's old target still 404s
   rather than quietly becoming something.

6. **The shared `/components` namespace is left exactly as it is.** The map ruled
   the `/primitives` rename out of scope twice and `03` already put the segment in
   one named constant; none of the decisions above touch the namespace.
