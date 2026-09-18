# OG card: reproduce or redraw

Type: grilling
Status: open

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
