# OG card: reproduce or redraw

Type: grilling
Status: resolved

## Question

Graduated from `11-og-image-parity`, which established the facts but left its
question 6 — reproduce the current card design, or redraw it — as a decision.
Read that ticket's `## Answer` first; the design is documented precisely enough
to rebuild from, and the reference PNGs are on branch `research/og-image-parity`.

Six facts bear on the decision:

1. **Pixel-exact parity is impossible.** Today's card is rendered by Takumi
   (Rust); a Next.js `ImageResponse` renders through Satori. Text metrics and
   `textWrap: balance` line-breaking differ. Visual parity is the ceiling, so
   "reproduce" can only ever mean "visually indistinguishable", never identical.
2. **The URL pattern is frozen regardless** — `/og/<route>.png`, with
   `/og/index.png` for the landing page. That constrains the implementation
   (a catch-all route handler) but not the design.
3. **The card ignores the site palette today.** Its colors are hard-coded in
   Blume's `og/card.ts`, not read from `theme.css`. A redraw could put it on the
   real tokens; reproducing means keeping `#fafafa` / `#0a0a0a` / `#737373` /
   `#e5e5e5` as literals.
4. **The card's font is not the site's font.** Cards draw in Geist (Takumi's
   built-in), pages render in Inter (Blume's default). Reproducing preserves
   that mismatch; redrawing is the moment to fix it. Note `ImageResponse` needs
   `ttf`/`otf`/`woff` — no woff2 — inside a 500 KB budget including fonts.
5. **Two drawn-vs-declared bugs would be reproduced if parity is the goal.** The
   drawn description is the *site* description on all 85 cards while
   `og:description` is per-page; and the drawn headline is a bare title while
   `og:title` carries the suffixed form (`/terms` draws "Terms", declares
   "Terms of Service — SevenUI").
6. **There is no dark variant** and no per-page-type variation — one light
   design, headline swapped.

Settle:

- Reproduce (visually), redraw, or reproduce-then-fix-the-bugs?
- If the bugs are fixed, is the per-page description drawn, and is the headline
  the bare title or the declared `og:title`? Both change what every card looks
  like.
- Does the card gain a dark variant, or stay single-light? (Social platforms do
  not respect `prefers-color-scheme` for OG images, so this is an aesthetic
  call, not a technical one.)
- Does the 16-block-page 404 `og:image` bug get a card, or get its tag removed?
  Any Next.js implementation fixes it incidentally by generating one — confirm
  that is wanted rather than accidental.

## Update from `15-agent-facing-and-seo-surface`

The declared titles this card sits next to have changed under it. `15` audited
all 85 live routes (68 ASCII hyphen, 16 em dash, 1 bare) and set one rule —
`<page> — SevenUI`, landing page exempt. Consequences for this ticket:

- The 10 gallery pages are renamed `X — SevenUI Components` → `X Components —
  SevenUI`, **before the cutover**, on today's Blume site. So their `og:title`
  and `og:image:alt` have already moved by the time the port ships.
- The 68 docs `og:title`s change separator **in** the cutover.
- Fact 5's bare-vs-declared question is unchanged in kind, but there is a new
  data point: `15` took JSON-LD's `headline` **bare** on every page, aligning it
  with every `<h1>`. That is a `headline` decision, not a binding constraint on
  what the card draws.

## Answer

Resolved 2026-09-19. Facts were re-established from Blume's **unminified
source** (`node_modules/.pnpm/blume@1.5.3_patch*/…/blume/src/og/card.ts` and the
`ogEndpointTemplate` in `dist/cli/index.js`), not from `11`'s summary. Three of
the question's six premises were wrong or under-specified; those corrections are
recorded first because they change what "reproduce" even means.

### Premise corrections

1. **"The drawn headline is a bare title" is two rules, not one.**
   `ogEndpointTemplate`'s `getStaticPaths` builds from two sources, and a
   **custom page** wins over a **content route** sharing its path:

   | page kind | headline source | result |
   |---|---|---|
   | content route (68 docs `.mdx`) | `route.title` — the frontmatter title | `/docs` draws "Introduction"; `input-otp` draws "Input OTP" correctly |
   | custom page (17 `pages/*.astro`) | `humanizeSegment(last URL segment)` | `/terms` → "Terms"; `/components/button` → "Button" |
   | `/` | `config.title` | "SevenUI" |

   So the 68 docs cards are **already correct**. The divergence is confined to
   **12 of 85 cards**: `/terms` ("Terms" vs *Terms of Service*), `/privacy`
   ("Privacy" vs *Privacy Policy*), and the 10 gallery pages ("Button" vs
   *Button Components*, post-`15`). Fact 5's "bug" is an order of magnitude
   smaller than the ticket assumed.

2. **The per-page description is a Blume *limit*, not a Blume bug.** The
   endpoint passes `data.config.og.description` — one site-level string, typed
   `string | false`. Blume has no per-page card description at all. Meanwhile 68
   distinct descriptions exist in frontmatter (median 64 chars, max 156).

3. **"The card ignores the site palette" is 2 of 5 colors, not 5.** Converting
   the light tokens: `--foreground: oklch(0.145 0 0)` = **#0a0a0a**,
   `--muted-foreground: oklch(0.556 0 0)` = **#737373**, `--border: oklch(0.922
   0 0)` = **#e5e5e5** — exact matches to the card's literals. Only two diverge:
   the card's `#fafafa` against a `--background` of pure **#ffffff**, and
   `#a3a3a3` (footer-right), which has no token at all.

Two further findings from the source: `accent` is **dead code here** — it only
paints `initialMark`, the fallback used when no logo is configured, and we
configure one; and `textWrap: "balance"` is on the **description** too, not just
the headline.

### The frame: not one decision

"Reproduce or redraw" is not a single choice. It dissolves into five independent
axes plus four mechanics decisions, and they were settled separately.

### Decisions

1. **Composition and type scale: reproduced verbatim.** 1200x630, padding 72,
   `space-between` column; 32x32 logomark alone (viewBox `0 0 64 64`, aspect 1);
   headline 76/600/`-0.05em`/`lineHeight 1.05`/`maxWidth 1010`/balance;
   description 30px/1.4/`marginTop 28`/`maxWidth 900`/balance; 1px `#e5e5e5`
   rule then a 22px footer row. The 76/64/52 size tiers are **dead code for us**
   — the longest title on the site is "Message Scroller" (16 chars) and even a
   fully suffixed form stays under the 40-char threshold, so every card renders
   at 76 regardless. Blume's `-0.05em` is, by its own comment, "tuned for Inter"
   while the card draws in Geist; that mismatch ships today and is kept.

2. **Font: Geist 400 + 600 as local TTFs.** Google Fonts serves Geist v5 as
   **TTF** to a non-woff2 UA — 72,916 B at 400 and 73,048 B at 600, so 146 KB of
   `ImageResponse`'s 500 KB budget (which counts fonts). Read as raw bytes at
   module scope. Verified by parsing the `cmap`: **729 glyphs**, full
   latin + latin-ext, including U+2014 and U+2026. The card stays on Geist
   rather than moving to Inter, per `12`'s instruction — when `12`'s deferred
   Geist-for-the-site effort lands, card and site converge for free. The Google
   v5 build may differ in metrics from Takumi's embedded copy; absorbed by
   "visual parity is the ceiling".

3. **Headline: the page's bare title, everywhere.** One rule replaces two.
   Docs cards stay byte-identical in content; the 12 divergent cards are fixed.
   The declared `og:title` is **not** used verbatim — the site name already
   appears twice on the card (logomark, `sevenui.dev` footer) and a third would
   be redundant. This aligns with `15`, which took JSON-LD's `headline` bare on
   every page to match every `<h1>`; the card's headline is a visual `<h1>`.

4. **Description: the page's own, site description as fallback.** Today the card
   spends its only content line on a string identical across all 85 cards — zero
   information. `/account` declares no description and is exactly what the
   fallback is for. This is the single largest quality gain available and the
   one place where reproducing actively costs something.

5. **Palette: the five literals are kept, `#fafafa` included.** The card is
   light-only and baked at build, so it can never follow the theme — "reading
   tokens" would be a one-time copy either way, and it would add a build-time
   coupling from the OG route into `globals.css`, which `07` established as the
   token owner for the *runtime*. The off-white also does real work: it
   separates the card from a white chat bubble. The spec records the five
   literals as a deliberate mirror of the light theme, naming the two with no
   token counterpart.

6. **No dark variant.** No social platform honours `prefers-color-scheme` for OG
   images, so a dark card could only ever be selected by a query param nothing
   sets — while doubling the surface `13` must verify.

7. **The block routes get cards.** Correcting the count: `11` said 16 (3 groups
   + 13 categories); `09` later measured the live manifest at **3 groups / 14
   categories**, so **17** cards are missing, not 16. This is a binding
   constraint on decision 9, not an incidental fix: `09` established that
   `generateStaticParams` does **not** re-run on revalidation and that new
   categories render via `dynamicParams`, so an OG route with `dynamicParams =
   false` would 404 the card for every newly added category — reintroducing this
   exact bug on a delay.

8. **One metadata registry: `lib/page-meta.ts`.** Next has no API for reading
   another route's metadata, so decisions 3 and 4 ("drawn equals declared") only
   hold if one source feeds both. Docs entries derive from `02`'s content index,
   block entries from `09`'s manifest, custom pages are declared explicitly —
   and each `page.tsx`'s `generateMetadata` reads **from the registry** rather
   than declaring inline. The registry stores the **bare** title; `15`'s
   `<page> — SevenUI` suffix is applied in one place. Without this, the first
   edit to a page description silently desynchronises its card. Footer strings
   (`useui/sevenui`, `sevenui.dev`) come from `14`'s `lib/site.ts`.

9. **Render strategy: one catch-all, `dynamicParams: true`, `revalidate: 300`.**
   `app/og/[...slug]/route.tsx`; `generateStaticParams` enumerates the ~102
   known slugs (85 today + 17 block) from the registry's three sources, reading
   the manifest off `09`'s Data Cache entry — same URL, so free. `revalidate:
   300` matches what `15` made a site-wide ceiling. Blume's `Cache-Control:
   public, max-age=31536000, immutable` is **dropped**: `immutable` on an
   ISR-revalidated asset is a lie, and Vercel already owns the CDN tier for the
   prerendered ones. The rejected alternative was two routes (a dynamic
   `app/og/blocks/[...slug]` beside a fully-static catch-all) — two honest cache
   policies, but bought with a fragile assumption about which of two nested
   catch-alls wins.

10. **Unknown slug: registry lookup, else `notFound()`.** This is what makes
    decision 9 safe rather than a sequel to it. Without the lookup,
    `dynamicParams: true` plus humanization would turn `/og/<anything>.png` into
    an **image generator hosted on sevenui.dev, looking like ours, with text the
    caller chooses** — a real abuse surface for a social preview card. It is
    also parity: a missing file 404s in today's static build. `19` owns 404
    behaviour generally; this route's rule stays here.

11. **Truncation: description 160, title 64 unchanged.** 160 is the smallest cap
    that leaves every live description whole (max 156). The cap is a safety net,
    not a typographic limit: the content box is 486 px (630 − 144 padding),
    fixed furniture takes ~195 px (mark 32 + headline ~80 + gap 28 + footer
    ~55), so a 4-line description at 168 px totals 363 px with 123 px to spare —
    5 lines still fit. A cap stays because the registry will accept new
    descriptions later and an unbounded one would overflow silently. `truncate(title, 64)`
    never fires post-decision-3 and is kept as-is.

12. **The 12 headline fixes ship to `main` before the cutover.** Blume's
    `seo.og.titles` is keyed by route and its own type comment reads: *"Card
    headlines for custom `.astro` pages, keyed by route… Content pages always
    take their card headline from the page title."* — which is exactly the 12
    divergent cards and nothing else. Adding entries for `/terms`, `/privacy`
    and the 10 gallery routes to `blume.config.ts` keeps them out of `13`'s
    diff entirely, mirroring `15`'s precedent with the 10 gallery titles. The
    description fix **cannot** be pre-shipped (`og.description` is a single
    site-level string), so it lands in the cutover.

13. **The OG surface's verification method, which `13` left without one.** `13`
    settled automated text/DOM diffing plus sampled human review and rejected
    screenshot diffing — none of which applies to an image, and its ~85-card
    count is now ~102. Three layers:

    - **Automated sweep over all ~102**: 200 status, `image/png` content type,
      byte length above a floor. This alone would have caught `11`'s live bug.
    - **Diff the card's input, not its output.** The drawn text is unreadable
      from the PNG, but the registry is text: asserting `lib/page-meta.ts`'s
      `{title, description}` against the same route's `generateMetadata` output
      turns "did the card draw the right words" into a text diff `13`'s existing
      machinery already runs. This is the only automated check that proves
      decisions 3 and 4 held.
    - **A fixed — not random — 6-card human review**: landing, one docs
      primitive, one docs guide, one gallery page, one block category, one legal
      page. Fixed matters: every card changes deliberately, so the reviewer is
      confirming the rule held, not that nothing moved.

### Consequences for `13`'s intended-diff list

Three entries, not 102: descriptions become per-page across all cards; 17 block
cards come into existence where a 404 stood; and no headline diff remains, because
decision 12 pre-ships it.

### Satori fidelity

`textWrap: "balance"` **is** implemented by Satori (0.33.4 `dist/index.js`,
inside `setMeasureFunc`: a binary search for the narrowest width that does not
increase height), so both the headline's and the description's balancing carry
over. Break points will not match Takumi's exactly; that is inside the declared
"visual parity is the ceiling".
