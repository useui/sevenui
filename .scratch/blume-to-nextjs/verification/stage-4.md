# Stage 4 — Landing, gallery, legal

Branch `feat/blume-to-nextjs`. Tasks 4.1, 4.2, 4.3. Every gate below was run against the **live
preview deployment**, not a local build, except where a local build is the only thing that can
answer (page counts, typecheck).

Commits: `0062f7e` (landing) · `76ff130` (landing polish) · `a78b6bf` (gallery) · `98e5db5` (legal).
Spec/plan amendments: `801f25e`, `ec2dc0f`, `b36585a`, `83153fd`, `7a45fd2`, `cd01f38`.
Stage 3's runtime debt closed in `8a3cdd0`.

## Gates

| Gate | Result |
|---|---|
| `pnpm --filter @sevenui/web build` | PASS — **85** static pages (72 + 11 gallery + 2 legal) |
| `pnpm -r typecheck` | PASS — clean |
| §17.2 link set, `/` vs production | PASS — 99 → 98, **zero unowned differences** |
| §17.2 link set, `/components` | PASS — 62 → 61, zero unowned |
| §17.2 link set, `/components/button` | PASS — 57 → 56, zero unowned |
| §17.2 link set, `/terms` | PASS — 38 → 37, zero unowned |
| §17.2 link set, `/privacy` | PASS — 37 → 36, zero unowned |
| §17.2 heading arrays, all five routes | PASS — **identical as JSON**: depth, text and anchor id, not just counts |
| Legal body text vs production | PASS — **byte-identical**: `/terms` 7946 = 7946 chars, `/privacy` 7160 = 7160 |
| Component wall | PASS — **66** cells (65 `registry:ui` + the trailing docs cell), no `Form (RHF)`, `Input OTP` present |
| `<title>` set | PASS — `SevenUI`; `Components — SevenUI`; `Button Components — SevenUI`; `Dropdown Menu Components — SevenUI`; `Terms of Service — SevenUI`; `Privacy Policy — SevenUI` |
| JSON-LD `headline` bare (§17.6 #18) | PASS — `"Button"`, `"Components"`, `"Terms of Service"` on all 13 pages |
| `/` carries `WebSite` alone | PASS — no `TechArticle` in its `@graph` |
| Literal external anchors (§4.6) | PASS — **5**: 4 in `site-footer.tsx` + 1 in `privacy` |
| §17.4 negative paths, **navigated** | PASS — `/components/not-a-component` **404**, `/components/tooltip` **404**, `/docs/components/not-a-thing` **404**, all titled `Page not found — SevenUI`; controls `/components/tabs` and `/components` 200 |
| Pre-existing pages unchanged by Stage 4 | PASS — **70 of 70** routes byte-identical in stripped `<body>` between the pre-4.2 and post-4.2 deployments |
| Registry JSON (§17.4, absolute) | untouched this stage — no task wrote to `packages/registry` |

The two owned link differences excluded everywhere: `#blume-content` → `#content` (Stage 1, §13.3)
and the missing `/account` (Stage 6, Clerk).

## Routes reviewed by hand, in the browser

**`/` — the full matrix the plan demands for a pixel-near surface.** 3 widths (390 / 768 / 1440) ×
2 themes × 2 origins = 12 captures, 23 source-verified landmarks per view, matched by stable key
rather than DOM index. **Largest delta anywhere: 0.00px**, and total page height equal to the pixel
at every width — 6890 / 4757 / 3348.

**The gallery — the sampled matrix.** `/components`, `/components/button`, `/components/dialog`,
`/components/dropdown-menu` × 768 / 1440 × light / dark × 2 origins = 32 captures.
**Largest delta anywhere: 0px**, on every rect and every page height. `dropdown-menu` was in the
sample deliberately: it is the only two-word label, and it renders identically.

**Drawer.** At 768 the gallery drawer carries all 5 site tabs **and** all 10 gallery links, link
set identical to production's, separated by a border. Control pair: `/` carries the tabs and no
gallery links, on both origins.

**Persistence.** Clicking from `/components/button` to `/components/dialog` in the sidebar: a
`window` marker and a planted DOM attribute both survived, proving no document reload, and
`aria-current` moved correctly. This is the property the migration exists for.

**The drawer's real breakpoint is 1024px**, not the plan's guessed 768 — bracketed at
1020/1023/1024/1025/1028 during Stage 3's runtime closure. Both the resize-close and the
hamburger's own disappearance switch there.

## §17.6 rows landed here

**#15** — `copy-command` follows the package-manager preference on the landing page and the gallery
cards. Confirmed on the live page: the revealed variant computes `display: block` despite the CSS
declaring `inline` (flex blockification), and the longest dialect ellipsizes at `scrollWidth` 370px
against `clientWidth` 291px inside a 377px card.

**#18** — JSON-LD `headline` goes bare on 13 pages: the 10 gallery children, `/components`,
`/terms`, `/privacy`.

**Ratified this stage, after measurement:** #30–#38 (the set Stage 3 left for the human), **#39**
(the gallery nav's `aria-current`, measured 2 → 4 occurrences on `/components/button` with the
visible classes unchanged), **#40** (the code pane gains exactly 42px — 362.25 → 404.25 on
`/components/button`, 418 → 460 on the other two), and **#32 widened and corrected**: production's
gallery draws **no** language label at all, because its code-block call passes no title, so ours
adding `TSX` is extractable text where production had none.

## Not verified, and named

- **`og:*` / `twitter:*` are absent on `/` and all 11 gallery routes, and incomplete on docs
  routes (4 of 10).** Production emits 10 `og` + 5 `twitter` on every page. This is not a §17.6 row
  — Stage 9 owns the OG surface before the single merge — but nothing in Stage 9's tasks owned the
  *tag set*, so its Definition of done was amended to require the assertion over the tag set, name
  the six tags no route declares, and enumerate every non-docs route.
- **Font rendering and antialiasing** — outside the gate by §17.7.
- **Performance** — outside the gate by §17.7; the wall's 66 in-viewport `next/link`s prefetch and
  are carried into §18's recorded measurement at Stage 11 rather than pre-emptively capped.
- **`[data-sevenui-example]`'s typographic root reaches the gallery**, where production inherited
  `line-height: 1.5` from preflight. Inert today — all 40 examples on all 10 pages were checked and
  none has a text-bearing element without a `text-*`/`leading-*` ancestor — but a future gallery
  example with bare prose would diverge.
- **Sidebar scroll depth** was not independently exercised: the 10-item gallery list does not
  overflow at 1440, so persistence was proven by node identity rather than by a restored offset.

## Verdict

**Stage 4 PASSES.** Three tasks, four commits, two fix rounds, no Critical or Important defect
surviving review. The two surfaces the plan holds near pixel parity were measured against
production at 0.00px, the legal documents are byte-identical, and the one behaviour that had to be
proven rather than described — that a registry item does not add a gallery route — was proven by
navigating to `/components/tooltip`, a real registry item, and getting a 404.
