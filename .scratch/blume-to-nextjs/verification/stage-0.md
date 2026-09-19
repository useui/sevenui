# Stage 0 — Pre-ship to `main`, freeze the baselines

Record per §17.7. One line per gate, plus the hand-reviewed routes and a verdict.
Not a report.

Stage lands on: `main` (the only stage that does). Base `3481f66` → head `865bb77`.

## Gates

| Gate | Result |
|---|---|
| Task 0.2 stop-condition — `seo.og.titles` in Blume 1.5.3 typings | PASS. `OgConfig.titles?: Record<string, string>` at `dist/types/core/config-input.d.ts:970`, mirrored in `schema.d.ts:979`. Pre-ship #2 is possible; the 12 cards stay out of §17.6. |
| Task 0.2 precondition (not stated in the plan) — `titles` binds custom `.astro` pages only | PASS. All 12 target routes are custom `.astro` pages: `pages/terms.astro`, `pages/privacy.astro`, and the 10 under `pages/components/`. |
| Task 0.3 link count vs §11.7.3 | PASS. Exactly 4 base-relative links found, matching the spec's contract. Post-change internal `](/docs/...)` count: 45. |
| Task 0.3 idempotency | PASS. Live production HTML and the freshly built local HTML both serve `href="/docs/components/field"` — the rendered page is unchanged. |
| Task 0.4 Step 1 — production deploy | PASS. See the three probes below. |
| Task 0.4 Step 4 — fixture sanity (§21.3 vacuous-pass guard) | PASS. Every assertion matched its expectation exactly; no expectation was adjusted. |
| Build succeeded on every task | PASS. 242 pages, no errors, no warning for the new `seo` key. |

## The three production probes (Task 0.4 Step 1)

Run against `https://sevenui.dev` after the deploy of `865bb77`.

- `<title>` on `/components/button`: `<title>Button Components — SevenUI</title>` — expected.
  All ten gallery titles checked, not just this one: Accordion, Badge, Button, Card,
  Dialog, Dropdown Menu, Input, Select, Switch, Tabs — each `<Name> Components — SevenUI`.
- `llms-full.txt`, count of `](/components/`: **0**. Count of `](/installation)`: **0**.
- `/docs.md` carries `](/docs/components/field)`.

## Build-time baseline (§18.5)

| Run | real (s) | user (s) | sys (s) |
|---|---:|---:|---:|
| Cold | 23.26 | 38.17 | 8.81 |
| Warm | 23.80 | 37.83 | 7.42 |

Machine: Apple M1 Pro, 10 cores, 32 GB, macOS 26.6.2, Node v24.20.0. `main` @ `865bb77`.

Caveat recorded in `baseline/build-time.md`: three unrelated Vite dev servers
(`sevenui-pro`, `sevenui-pro-2`) were running throughout both measurements. They were not
stopped — another project's, and behind a human gate. Not an idle-machine measurement.

Cold ≈ warm is expected here, not a botched cold run: the measured command is
`pnpm --filter @sevenui/web build`, which runs `shadcn build` three times (uncached
codegen, equally cold every run) before `blume build`, and a full SSG build re-touches
every route regardless of a prior run. The `rm -rf` did run.

## Fixture byte counts (Task 0.4 Step 4)

| File | Bytes | Expected (approx.) |
|---|---:|---|
| `llms.txt` | 9299 | 9.3K |
| `llms-full.txt` | 297404 | 297K |
| `sitemap.xml` | 5737 | 5.7K |
| `robots.txt` | 120 | 120 |
| `index.md` | 9299 | 9.3K |
| `agent-readability.json` | 565 | 565 |

`cmp llms.txt index.md` — identical, as §15.2 requires. `<loc>` count in `sitemap.xml`: 85.
`Content-Signal` count in `robots.txt`: 1. Truncation sweep (`-size -200c`): no output.
`.md` mirrors: 68. Route list re-derived from the corpus and diffed against the fixture
tree paths — identical; `/docs` present, `/docs/index` absent per §15.2.

## Hand-reviewed surfaces

- The 10 gallery `<title>`s, live on production (listed above).
- OG cards read **as images**, not inferred from byte size: locally during Task 0.2 —
  `og/terms.png` → "Terms of Service", `og/privacy.png` → "Privacy Policy",
  `og/components/button.png` → "Button", `og/components/dropdown-menu.png` →
  "Dropdown Menu", `og/components/switch.png` → "Switch". Re-confirmed on **production**
  during Task 0.4: `/og/terms.png` → "Terms of Service", `/og/components/button.png` →
  "Button".
- Four captured `.md` mirrors opened and confirmed to hold real page content, not error
  pages or stubs: `md/docs.md`, `md/docs/components/field.md`, `md/docs/components/spinner.md`,
  `md/docs/components/button.md`.
- `md/docs/components/field.md:107` carries `[Form](/docs/components/form)` — the repaired
  link. The same repaired string appears in `llms-full.txt:4524`. **This is the proof the
  fixtures were captured after the pre-ship deploy, not before**; Stage 0's whole ordering
  argument rests on it.
- Encoding integrity: no `â€"` mangling anywhere in the fixture tree; `llms.txt` carries
  the raw UTF-8 em dash (U+2014) in 4 places.

## §17.6 rows introduced

**None** — by design. That is the entire purpose of pre-shipping: these three changes are
on the *old* site, so they are not in the cutover's diff. Stage 11 re-asserts that the
gallery titles and the four links come out of the Next build identical to what `main`
already serves.

## Proof obligations resolved

None were due in this stage. Task 0.2's own stop-condition passed (see Gates).

## Deferred minor

`baseline/build-time.md` is titled a "`blume build`" measurement, but the command it times
is `pnpm --filter @sevenui/web build` — `build:registry` (three `shadcn build` invocations)
followed by `blume build`. The brief specifies exactly that command, so this is framing,
not a deviation. **Stage 11 must time the same whole-pipeline command, or state plainly
that it is comparing a narrower one**, or the §18.5 comparison is not like-for-like.

## Verdict

**PASS.** Four gates, three production probes, 74 fixtures and two build measurements, all
clean. Every task review returned spec ✅ with zero Critical/Important/Minor findings
except the single deferred minor above.
