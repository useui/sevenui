# Stage 8 — Agent-facing and SEO surface: verification record

§17.7's one short checklist per stage. Four commits on `feat/blume-to-nextjs`:

```
8c3c724 feat(web): serialize the three authored MDX components for agents      (8.1)
cf62524 feat(web): emit the 69 per-page markdown mirrors at build time         (8.2)
4094743 feat(web): reproduce the agent-facing and SEO surface                  (8.3)
20ce6f5 docs(spec): date §17.6's manifest-derived counts and widen two rows' reach
```

Baseline before any edit, at `ed189df`: `next build` green, **112 prerendered routes**.
After: **118** — the six new root endpoints, all static.

## The gate

`.superpowers/sdd/2026-09-19-blume-to-nextjs/stage8-gate.mjs`, run by
`capture-stage8.mjs` against either the local build output or the live preview.

**It does not diff and then explain.** Every file in this set is *supposed* to differ, in ways §17.6
names, so a diff-and-explain gate measures nothing. Instead it **reverses each declared difference on
our side and demands byte equality with the fixture**: a difference that is exactly what it was
declared to be reverses cleanly and vanishes, and anything else survives and fails at a named
character offset. Four reversals, each keyed to a named constant rather than a position or a count —
§17.6 **#1** (a four-line `bash` fence back to `<InstallCommand item="…" />`, the item recovered from
the commands and then the whole block required to equal the four they imply), **#4** (two named routes'
links back to absolute), **#29** (three named demo sources back to minus the directive, keyed to the
files' exact current bytes), **#26** (one `/docs/components` section/mirror).

**30 checks, 16 positive-control modes, every mode firing on its own check.** The blocks route list is
passed in from `scripts/route-inventory.mjs`, never hard-coded (Ruling 58).

| | local build | live preview |
|---|---|---|
| gate | **30/30** | **30/30** |

## Results, per file

| File | Criterion | Result |
|---|---|---|
| `robots.txt` | byte-identical | **120 B, identical** |
| `llms.txt` | fixture is an in-order subsequence; additions only | **all 78 fixture lines consumed in order; +42 / −0** |
| `llms.txt` | added link set | **exactly the 36 expected routes**, 0 unexpected, 0 missing |
| `llms.txt` | no route listed twice; every added route under its own section | **pass**, headings `## Components` \| `## Blocks` |
| `/index.md` | byte-identical to `llms.txt` | **14,186 B each, identical** |
| `llms-full.txt` | reverses to the fixture byte for byte | **297,404 B — the Stage 0 manifest's own recorded size** |
| `llms-full.txt` | section count | **69 → 68** after removing `/docs/components` (Ruling 56) |
| `agent-readability.json` | exactly two corrected fields, **and** byte-level reversal | **565 B, reverses identically** |
| `sitemap.xml` | URL-set equality + declared additions | **109 entries, 109 unique**, +24 / −0 against the 85-entry fixture, **0 decorated** |
| 68 `.md` mirrors | reverse byte for byte | **68/68**; reversed #1 ×68, #4 ×5, #29 ×3 |
| `/docs/components.md` | exists, no fixture, no special case | **pass** (§17.6 #26) |
| `/docs/index.md` | must not exist | **absent** (§15.2's slug rule) |
| three `<link>` tags | in `<head>`, per-page href, docs-only | **69/69 docs pages; 0 on 42 non-docs pages** |
| emitted mirror set | exactly the 68 fixtures + `/docs/components.md` | **69 emitted, 69 allowed, 0 extra** |
| `/docs/components.md` | 65 rows, each matching its fixture's own front matter | **65/65 exact** |
| `llms-full.txt`'s new section | the same 65 rows, same criterion | **65/65 exact** |

## Live, on the preview

The plan's Step 8 boots `next start` and curls localhost; this session's gate forbids every dev
server, so verification runs against **the build's own prerendered bodies** locally and **the preview
deployment** over HTTP — the latter being what actually ships, headers included.

**Content types match production on all six**, measured against `sevenui.dev` while it is still Blume:

```
/llms.txt   text/plain; charset=utf-8         /index.md                text/markdown; charset=utf-8
/llms-full  text/plain; charset=utf-8         /robots.txt              text/plain; charset=utf-8
/sitemap    application/xml                   /agent-readability.json  application/json; charset=utf-8
```

That measurement is also why `/index.md` is a second route and not a rewrite of `/llms.txt`
(Ruling 71): a rewrite would trade a transient body divergence for a permanent header one.

**The mechanism question, settled before two more tasks were built on it** (Ruling 66).
`/docs/components/button.md` **is** matched by `app/docs/[[...slug]]/page.tsx`'s pattern; the mirrors
work only because Vercel's filesystem handler runs first. Task 8.2 was committed and pushed on its
own so this could be measured live:

```
/docs.md                     200 text/markdown  2606 B      /docs/index.md      404
/docs/installation.md        200 text/markdown  2682 B      /components.md      404
/docs/components.md          200 text/markdown  7799 B      /blocks.md          404
/docs/components/button.md   200 text/markdown  4079 B      /docs/components/button  200 text/html 324 KB
/docs/components/sidebar.md  200 text/markdown 10966 B
```

Nested mirrors serve at two directory levels — not only the root one, which matches no app route and
would have passed either way. All **69** mirrors were then fetched from the preview and compared to
`apps/web/public/`: **69 identical, 0 differing, 0 non-200.**

**The negatives**, all measured over HTTP:

| URL | Expected | Measured |
|---|---|---|
| `/docs/index.md` | 404 (§15.2) | **404** |
| `/docs/components/button.mdx`, `/docs.mdx` | 404 (§17.6 #16 — the 69 `.mdx` URLs leave the contract) | **404, 404** |
| `/docs/components/nonexistent` | 404, and **no `<link>` tags** | **404, linkTags = 0** |
| `/components.md`, `/blocks.md` | 404 (§15.12) | **404, 404** |

156 URLs fetched from the preview; **0 unintended non-200s**.

## The page-actions rail — Stage 3's open thread closes

`pw/stage8-rail.mjs`, executed rather than clicked. `components/docs/page-actions.tsx` had said in its
own comment since Stage 3: *"STAGE 8 CREATES IT — until then this URL 404s."* **18 assertions, 0
failing.**

Two routes, chosen because their `.md` slugs derive differently (§15.2) so a rail that hard-coded the
`/docs/components/` shape would pass on only one:

- **Copy as Markdown** — the click was observed to fetch the page's own `.md` (1 request, 200), and
  the **clipboard equals the independently fetched document byte for byte** (4,079 B and 2,682 B).
  Not "the label said Copied!": that flips on any 200, including a 200 of the wrong document. The
  counter-case is asserted too — the served document contains route-specific text, so the comparison
  cannot pass on a body every page would match.
- **Open in chat** — 6 anchors, all six carrying the prompt with the **preview-absolute** `.md` URL,
  and none containing `sevenui.dev`. That is the point of building the prompt from
  `location.origin`: a preview hands an assistant its own URL, not production's.
- **The docs 404 carries no rail at all** (0), matching the tags' own absence there.

## Other gates

- `node scripts/route-inventory.mjs` after the `.mdx` drop: **docs 69, gallery 11, blocks 24,
  standalone 5, total 110.** The 69 `.mdx` URLs are gone — confirmed by fetching two of them.
- `pnpm -r typecheck` clean. `pnpm --filter @sevenui/registry test`: **65 files, 525 tests, all
  passing** — run because Ruling 65 moved code out of `lib/docs/index.ts`, and a change that reshapes
  a shared module is exactly the one whose damage shows up somewhere else.

## What this record does NOT cover

§17.7's rule: a gate is only honest when it says what it does not measure.

- **The gate is silent on `revalidate` placement and on response content types.** Both were verified
  directly — out of `.next/server/app/*.meta` (300 s on exactly `/llms.txt`, `/index.md`,
  `/sitemap.xml`, all three carrying the `pro-manifest` cache tag; `force-static` on the other three)
  and over HTTP against production. Neither is evidenced by a clean gate run.
- **`x-markdown-tokens` and `Accept: text/markdown` negotiation are not restored** (§15.13, §19), and
  **WebMCP is not ported** (§15.14, §17.6 #20) — verified absent from all built HTML.
- **Five blind spots were found in this gate during this stage**, three of them by reviewers, and each
  is recorded in the gate's own comments: the `sitemap` control was dead against the real artefact's
  whitespace; `checkLlms` used set membership and so was blind to reordering, duplication and orphaned
  headings — and made correct output unexpressible, which bent an artefact before it was noticed; the
  296 KB `llms-full.txt` assertion had no control at all; `checkAgentReadability` compared parsed JSON
  against a byte criterion; and the gate **read no HTML whatsoever**, so §15.11's three `<link>` tags
  — Task 8.3's second deliverable — could have been deleted or hoisted onto all 111 pages for a clean
  run. **A sixth was then found by the final whole-stage review**, and it is the one this stage should
  have expected: `checkMirrors` iterates the *fixture* tree, so the only page with no fixture — the
  page Ruling 61 exists to fix — was asserted to **exist** and nothing more, while `checkLlmsFull`
  deletes that same section before its byte comparison. The reviewer gutted the mirror and the section
  to a raw `<PrimitiveIndex />`, planted a stray mirror, and got **26/26**. All six are closed; the
  gate now asserts the emitted set (not the fixture subset) and the 65 rows on both surfaces, with
  three more control modes. **A seventh was then found by the fix wave's re-review**, in the check that
  closed the sixth: it matched `](<route>):` and stopped, never comparing the text *after* the colon,
  so falsifying one description — or all 65 — left the gate clean while only *gutting* the page failed.
  Falsification is the likelier regression, since the row text comes from each primitive's own front
  matter. Closed by comparing every row against **that primitive's own fixture front matter**, which
  needs no new baseline and means the rows are checked against production's own words: **65/65 exact on
  both surfaces**, with two more control modes. All seven are closed. An eighth is not ruled out.
- **`artifacts.markdown.pattern` still cannot express two live mirrors** — `/docs` is served at
  `/docs.md`, not `/docs/.md`, and `/` at `/index.md`. Kept deliberately (Ruling 73): the declared
  value is wrong for one route where production's universal pattern is wrong for the 36 non-docs
  routes `llms.txt` now lists.

## §17.6 rows

**No new rows.** Four corrected, in `20ce6f5`: **#2** and **#19** stated counts the pro manifest had
already moved past; **#4** and **#29** each named one surface where the change reaches three, which is
how this stage's first fixture run reported four declared differences as unexplained. §15.3's
"closed at two" was corrected to three, and §15.4/§15.7's counts dated.

Rows exercised here: **#1** (68 install blocks), **#2** (sitemap +23 blocks routes), **#4** (5 links),
**#16** (the `.mdx` URLs), **#19** (llms.txt +42), **#26** (`/docs/components`, on four surfaces),
**#29** (3 demo sources).
