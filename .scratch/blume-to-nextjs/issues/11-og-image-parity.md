# OG image parity

Type: research
Status: resolved

## Question

Blume generates an Open Graph image per page — the generated Astro app contains
`og/[...slug].png.ts` importing `blume/og`, and `seo.og` is on by default. The
output is live in production and is part of what social and chat previews show
today.

Establish the facts, then the decision:

1. **What does a current OG image actually look like?** Fetch several from
   production (a docs page, a primitive page, the landing page) and record the
   design: dimensions, background, typography, whether the page title and
   description are drawn, whether the logo appears, light or dark.
2. **Which routes get one?** All pages, docs only, or a subset — and what is the
   URL pattern? If it is a published URL it is inside the frozen contract.
3. **What fonts does it use, and where do they come from?** The generated
   `.blume/.astro/fonts/google-*` directory suggests a Google font is fetched
   and embedded. A Next.js `ImageResponse` needs the font file supplied
   explicitly as an `ArrayBuffer`.
4. **Are the meta tags themselves in scope?** Beyond the image: `og:title`,
   `og:description`, `og:url`, `twitter:card` and friends are emitted by Blume
   today. Record what is on each page type so `generateMetadata` can reproduce
   it.
5. **Next.js mechanics.** `opengraph-image.tsx` per route segment vs a single
   dynamic `/og/[...slug]` route: which reproduces the current URL pattern, and
   what are the runtime and caching implications for ~80 pages?
6. Then the decision: reproduce the current design, or redraw it? The parity bar
   permits behaviour+layout parity, and an OG image is not layout — but a
   changed preview card is user-visible.

Record findings as a Markdown file in the repo and link it from the answer.

## Context

Dispatched to a research subagent on 2026-09-18. Findings land at
`docs/superpowers/research/2026-09-18-og-image-parity.md`
on branch `research/og-image-parity`.

## Answer

Resolved 2026-09-18 by research subagent. Findings:
`docs/superpowers/research/2026-09-18-og-image-parity.md` plus 7 reference PNGs
pulled from production in
`docs/superpowers/research/2026-09-18-og-image-parity-samples/`, on branch
`research/og-image-parity` (commit `1619c7b`) — **not on `main`**.

**URL pattern (frozen contract).** `/og/<pathname minus leading slash>.png`;
`/` maps to `/og/index.png`. The `/docs` base path sits *inside* the slug:
`/og/docs/components/button.png`, not `/docs/og/...`.

**One design for every page type — only the headline changes.** 1200x630 PNG,
RGB, ~15-18 KB, **light only, no dark variant**. Background `#fafafa`, padding
72, flex column with `space-between`. Colors are hard-coded in Blume's
`og/card.ts` and are **not** read from `theme.css`. Header is `logomark.svg`
alone at 32x32 (`currentColor` string-replaced with `#0a0a0a`, inlined as a
base64 data URI), no wordmark. Headline `#0a0a0a`, weight 600, `letterSpacing
-0.05em`, `lineHeight 1.05`, `maxWidth 1010`, `textWrap: balance`, size
76/64/52 by length — every shipped title is under 40 chars so it is always 76 —
truncated at 64 code points. Description `#737373`, 30px, `lineHeight 1.4`,
`marginTop 28`, `maxWidth 900`, truncated at 140. Footer: 1px `#e5e5e5` rule at
y=500 spanning x 72-1127, then a 22px row with `useui/sevenui` left in
`#737373` and `sevenui.dev` right in `#a3a3a3`. The flex math was verified
against the measured pixels, so the design is reproducible from this spec.

**Font is Geist**, Takumi's built-in last-resort face embedded in its native
binding — nothing is fetched. `blume.config.ts` sets no `theme.fonts` and no
`seo` block. The `.blume/.astro/fonts/google-*` directory and the
`/_astro/fonts/*.woff2` preloads are the **site's** font (Inter, Blume's
default). So today **pages render in Inter and cards in Geist**. Weights drawn:
600 and 400.

**Meta tags.** Recorded per emitter in the findings. Invariants:
`og:site_name=SevenUI`, `og:type=website`, `twitter:card=summary_large_image`,
both `og:image` and `twitter:image` absolute, and one string reused across
`<title>`, `og:title`, `og:image:alt`, `twitter:title`, `twitter:image:alt`.
Content routes suffix `" - SevenUI"` (hyphen) in the layout; custom pages pass
their own already-suffixed title (em dash). Absent because unconfigured:
`twitter:site`, `twitter:creator`, `article:*`, `og:locale`.

**Two drawn-vs-declared discrepancies in production.** The *drawn* description
is always the site description on all 85 cards while `og:description` is
per-page; and the drawn headline is the bare title or humanized last segment —
`/terms` draws "Terms" while its `og:title` is "Terms of Service — SevenUI".

**Production bug found.** The 16 dynamic block pages (3 groups + 13 categories)
ship a **404 `og:image`**: Blume's `customOgRoutes` skips any `[param]` pattern
so no card is generated, but `PageLayout` emits the tag anyway —
`/og/blocks/marketing/hero.png` returns 404 `text/html`. Pre-existing, not
migration-caused, and incidentally fixed by any Next.js approach. Feeds the
intended-diff list in `13-parity-proof-method`.

**Next.js mechanics.**

- `opengraph-image.tsx` **cannot** reproduce the frozen URLs: Next serves it at
  a generated hashed URL, and file-based metadata *overrides*
  `generateMetadata`, so the file cannot be kept while pointing `og:image`
  elsewhere.
- A catch-all `app/og/[...slug]/route.tsx` is the only shape that reproduces
  the pattern, `/og/index.png` included. It is not a special metadata route, so
  it gets no default caching (GET handlers are dynamic-by-default since
  15.0.0-RC). Prerender with `generateStaticParams` plus `force-static` and
  `dynamicParams = false` to match today's 85 build-time PNGs, or cache at the
  CDN through `ImageResponse`'s `headers`.
- Edge runtime is not required and is **deprecated in 16** — v14 `runtime =
  'edge'` examples are stale. `params` is a promise in 16.
- `ImageResponse` limits: flexbox only (`display: grid` does not work), **500 KB
  total including fonts**, `ttf`/`otf`/`woff` only (no woff2), fonts as raw
  bytes read at module scope (`next/font` inside `ImageResponse` is
  unsupported). Everything the current card needs is inside Satori's supported
  subset, but `currentColor` still needs string replacement.
- **Pixel-exact parity is not achievable**: today's card is rendered by Takumi
  (Rust), the Next.js one by Satori. Text metrics and `textWrap: balance`
  line-breaking differ. Visual parity is the ceiling.

**Item 6 (reproduce or redraw) is not answered here** — it is a decision, and
it graduated into `16-og-card-reproduce-or-redraw`.
