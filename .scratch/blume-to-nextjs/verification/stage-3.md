# Stage 3 — Docs chrome and page furniture

Branch `feat/blume-to-nextjs`, tasks committed `b589163`, `bca880d`, `2d1cf5f`, `cdb8d9d`.
All counts below are from a fresh build read in the same step, with `<script>` stripped first —
Next inlines the RSC flight payload, which roughly doubles a naive className count.

## Definition of done

| Item | Result |
|---|---|
| 69 docs routes build, each inside the persistent layout | **PASS** — 69 prerendered; `/docs/components` is a real MDX page |
| Sidebar: `aria-current` tracks navigation | **PASS** (preview) — active label moved Tooltip → Accordion with no reload |
| Sidebar: group forces open, never closed | **PASS static + preview** — `<details open>` on a primitive, closed on `/docs` and `/docs/theming`; open on a primitive in the deployed build |
| Sidebar: scroll position persists | **PASS (preview)** — the aside is the **same DOM node** across a client-side navigation, so the layout was not remounted. §17.6 #6 is a mechanism change, not a new behaviour: Blume already persisted it via `astro:before-swap`/`after-swap` |
| TOC: one hook, two renderers | **PASS** — one `useActiveHeading` in the layout feeds both; entries identical to production **entry-for-entry on 68/68 routes**, both variants |
| TOC: correct after demo hydration | **UNVERIFIED** — frame-driven; see Limits |
| Breadcrumb: 3 items / 2 / none | **PASS** — `Docs / Primitives / Button`; `Docs / Installation`; `Docs / Theming`; `/docs` renders none |
| Breadcrumb: `nav > ol > li` + `aria-current="page"` | **PASS** — `aria-label="Breadcrumb"` 1 per breadcrumbed page, 0 on `/docs` |
| `BreadcrumbList` in the `@graph` | **PASS** — `['WebSite','TechArticle','BreadcrumbList']`, items `(1 Docs) (2 Primitives) (3 Button)`, contiguous |
| `/docs/components` renders 65 cards, appears in the nav **once** | **PASS** — 65 `rounded-xl` cards; the exactly-once assertion passes, and dropping the group `href` reproduces `nav must contain /docs/components exactly once, found 0` |
| Docs 404 arrives with the sidebar, no group opened | **PARTIAL** — Next emits no prerendered HTML for a nested `not-found`. The boundary compiles to the root 404's own module (bundle-verified) and `/docs`, the nearest analogue, prerenders the group **closed**. The rendered DOM goes to the preview |
| `rounded-blume` appears nowhere in ported code | **PASS** — 0 in the built DOM and 0 in the shipped CSS (control: `--radius` 71×). One comment in `toc.tsx` names `--radius-blume` as the thing that was replaced; that is a record of removal, not a survival |

**§8.3's prediction confirmed exactly**: `max-w-content` is **5** on a primitive page — article,
breadcrumb, mobile TOC, feedback, pagination — and **4** on `/docs`, which renders no breadcrumb.

## §17.6 rows landed here

**#6** (sidebar scroll persists — see the correction above), **#22** (the real trail), **#23**
(`BreadcrumbList`), **#25** (feedback `title` is the bare title from `lib/page-meta.ts`, not
`document.title`), **#26** (`/docs/components`), **#27** (`rounded-blume` → `rounded-lg` on the four
furniture elements: pagination ×2, the mobile TOC `<details>`, the feedback button class).

## Proof obligations

None resolve here. **Open thread carried forward:** the rail's "Copy as Markdown" fetches a `.md`
URL **Stage 8 creates**, so it 404s until then. Implemented in full; it logs rather than flashing a
false confirmation. **Not counted as a pass** — re-verify in Stage 8.

## Differences with no §17.6 row, added to the ratification set

1. **The "Edit on GitHub" link is repaired.** Production points all 68 at `/edit/main/docs/<slug>.mdx`
   and the corpus has lived at `apps/web/docs/` since the monorepo migration, so **all 68 are broken**.
   All **69** now resolve to a real file on disk, verified by existence-checking every emitted href.
2. **Prev/next gains a hop.** `/docs/theming` → **`/docs/components`** → `/docs/components/accordion`,
   where the plan records `/docs/theming → /docs/components/accordion`. A direct consequence of #26:
   the group has a landing page now, and `flattenLinks` orders a section before its children, which is
   where a reader meets it.
3. **The `<aside>` is nested inside `<main>`, and the skip link's target now begins at the sidebar.**
   §11.1 gives `<main id="content">` to the root layout and has nested layouts add their sidebars, so
   every docs sidebar renders inside `<main>` by construction. The second half is a small but real
   accessibility regression — "Skip to content" no longer skips the navigation — and the honest repair
   is a spec-level decision about who owns `<main>`, not a mid-stage improvisation.
4. **+5.3 KB gzip per docs page** of serialized heading data. The layout sits above `[[...slug]]`, so
   it receives no `params`, and the two TOC renderers occupy different grid tracks, so their shared
   hook must be their common ancestor. `/docs/components/button` is 27.1 KB gzip against production's
   23.7 KB. Performance is measured once at the end of the branch and gates nothing (§18.2, §17.7),
   but §18.4's contributor list should gain this row.

## Limits — what this stage did NOT verify

**Everything frame-driven is unverified, and the cause is isolated.** The automated browser tab runs
with `document.visibilityState === "hidden"`, where measurement shows `requestAnimationFrame` never
fires, `IntersectionObserver` never calls back, and `window.scrollTo` does not move the page
(`scrollY` stayed 0 against a `scrollHeight` of 3768). A hidden tab has no compositor.

So these are recorded **UNVERIFIED**, not passing: scroll-spy tracking past the 72px line, the
document-bottom force, TOC correctness after the 84 demos hydrate, the mobile drawer's slide,
backdrop, scroll lock and `inert` flip, close-on-resize past `lg`, a manually-collapsed group
surviving navigation, the chevron rotation, the GA4 `feedback` event firing (gtag is production-only),
and the docs-miss **status code** (a runtime `notFound()`).

**The instrument that can measure them already exists**:
`.superpowers/sdd/2026-09-19-blume-to-nextjs/pw/stage2-preview.mjs` launches a real headless Chromium
where rAF and IntersectionObserver do fire. It needs `PREVIEW_URL` and `VERCEL_BYPASS`, and only the
human can supply the bypass secret. `npm i` in that directory first.

**Verdict: Stage 3's structural half PASSES in full.** Its runtime half is deferred to a Playwright
run, with the blocking input named.
