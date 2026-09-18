# Route inventory — the parity surface

Derived 2026-09-18 from production (`https://sevenui.dev`), not typed from
memory. Sources noted per section. Belongs to
`issues/13-parity-proof-method.md`.

**Headline: `sitemap.xml` is not a sufficient inventory.** It lists 85 URLs and
omits the 16 live `/blocks` group and category routes entirely, plus every
agent-facing endpoint and every OG image. An inventory built from the sitemap
alone would declare parity while 16 published pages were missing.

## A. HTML pages — 101 routes

### A1. Docs content pages — 68 (source: `apps/web/docs/**/*.mdx`, all in sitemap)

- `/docs` (from `docs/index.mdx`)
- `/docs/installation`, `/docs/theming`
- `/docs/components/<name>` — 65, one per `docs/components/*.mdx`

### A2. Components gallery — 11 (source: `apps/web/pages/components/*.astro`, all in sitemap)

- `/components`
- `/components/<name>` — 10: accordion, badge, button, card, dialog,
  dropdown-menu, input, select, switch, tabs

Note: the gallery's *contents* are derived at build time from
`packages/registry/components/registry.json` (41 items) via
`pages/components/_data.ts`, but the page set is the 10 hand-written `.astro`
files. Adding a registry item does not add a route.

### A3. Blocks — 17, of which **only `/blocks` is in the sitemap**

Derived from the live pro manifest (`/r/pro-manifest.json`: 3 groups,
13 categories, 59 items). All verified 200 in production:

- `/blocks`
- `/blocks/<group>` — 3: `application`, `marketing`, `ai-and-agents`
- `/blocks/<group>/<category>` — 13: application/{dashboard, auth, profile,
  account, app-shell}, marketing/{logo-cloud, cta, pricing, faq, hero, footer,
  feature}, ai-and-agents/{ai-chat}

**This set is manifest-driven and therefore not fixed.** It is exactly the
surface ISR makes self-updating, so the inventory must record it as "derived
from the manifest at verification time", never as a frozen list.

### A4. Standalone pages — 5 (all in sitemap)

`/`, `/pro`, `/account`, `/privacy`, `/terms`

### A5. Not in the sitemap, still a route

- `404` — Blume generates it (`.blume/src/pages/404.astro`); the 404 body is
  21,026 bytes, which is how every probe above was identified as a miss.

## B. Agent-facing and SEO endpoints — 74

Source: live probes. None appear in the sitemap. All are root URLs and
therefore inside the frozen URL contract.

| Endpoint | Count | Verified |
| --- | --- | --- |
| `/llms.txt` | 1 | 200, 9.3 KB |
| `/llms-full.txt` | 1 | 200, 297 KB |
| `/sitemap.xml` | 1 | 200, 5.7 KB |
| `/robots.txt` | 1 | 200, 120 B (`Content-Signal: search=yes, ai-input=yes, ai-train=yes`) |
| `/index.md` | 1 | 200, 9.3 KB |
| `<docs route>.md` | 68 | 200 `text/markdown` |

**The per-page `.md` rule, established by probe:** it is `<route>.md`, and only
for MDX content pages. `/docs.md`, `/docs/installation.md`,
`/docs/components/button.md` all 200. `/docs/index.md` 404s — the rule is not
`<route>/index.md`. Custom `.astro` pages produce nothing: `/components.md`,
`/components/button.md`, `/blocks.md`, `/pro.md`, `/privacy.md` all 404.
`/index.md` is the root's stand-in and carries the same 9.3 KB as `/llms.txt`.

Detail belongs to `issues/15-agent-facing-and-seo-surface.md`; this section
exists so the inventory is complete.

## C. OG images — ~85+

Pattern confirmed from a live page's meta tag:
`og:image` = `https://sevenui.dev/og/<route>.png`, e.g.
`/og/docs/components/button.png`. Published URLs, so inside the frozen
contract. Exact route coverage and the design belong to
`issues/11-og-image-parity.md` (under research).

## D. Registry JSON — 247 files (separate, absolute gate)

Produced by `shadcn build` into `apps/web/public/r` (gitignored). Current
counts: `/r/*.json` 68, `/r/demo/*.json` 138, `/r/component/*.json` 41.

Framework-independent by construction — the shadcn CLI reads
`packages/registry`, which this migration does not touch. The gate is therefore
**byte-identical output**, cheap and absolute, and any diff at all is a
regression. `scripts/check-registry.mjs` already exists.

## E. Rewritten to the pro deployment — not our output

From `apps/web/vercel.json`; must keep resolving, verified rather than
reproduced: `/r/pro-manifest.json`, `/r/pro/:name`, `/api/me/licenses`,
`/previews/:path*` and `/previews/:path*/` (both forms — a trailing-slash
mismatch has bitten this project before).

## Totals

| Surface | Count | In sitemap |
| --- | --- | --- |
| Docs pages | 68 | yes |
| Components gallery | 11 | yes |
| Blocks (manifest-derived) | 17 | only `/blocks` |
| Standalone pages | 5 | yes |
| 404 | 1 | no |
| Agent/SEO endpoints | 74 | no |
| OG images | ~85+ | no |
| Registry JSON | 247 | no |

**101 HTML routes, 74 text endpoints, ~85 images, 247 JSON files.**
