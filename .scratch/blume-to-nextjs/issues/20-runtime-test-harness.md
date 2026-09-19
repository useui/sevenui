# Runtime test harness for apps/web

Type: grilling
Status: out of scope
Assignee: Oğuzhan (this session)

## Question

`apps/web` has no runtime test harness: zero test files, no `vitest` in its
`package.json`. All 66 test files in the repo live in `packages/registry`.
`13-parity-proof-method` settled how the *cutover* is verified — route diffing
over 101 HTML routes, 74 text endpoints, ~102 OG cards and 247 JSON files — and
deliberately never touched unit testing. `14-blume-shaped-workarounds-to-retire`
closed the static half of the gap (the new `tsconfig.json` takes Next's default
`include`, so `apps/web`'s own sources get typechecked for the first time).
What is left unowned is the **runtime** half.

This is the last open patch on the map. Settle:

1. **Does the migrated `apps/web` get a runtime test harness at all, within this
   effort?** The honest alternatives are: (a) yes, shipped on the migration
   branch; (b) no — `13`'s parity gate is the verification this cutover gets,
   and a harness is a separate post-cutover effort; (c) a minimal harness
   covering only what the parity gate provably cannot see. Decide which, and
   say why in terms of what the cutover actually risks.

2. **If yes: what does it cover?** The migration creates a body of pure,
   headless logic that did not exist before, and the parity gate can only see it
   through rendered routes. Candidates surfaced by resolved tickets:
   - the content index and its zod frontmatter parse (`02`)
   - the nav tree derivation and its slug sort (`03`)
   - the search matcher's hand-written weighted ladder (`08`) — `08` chose to
     own ranking rather than delegate to Base UI's filter
   - the pro-manifest loader's shape validation (`09`)
   - `lib/page-meta.ts`, whose whole purpose is that "drawn equals declared"
     cannot desync (`16`)
   - the scroll-spy hook (`17`), `lib/site.ts` (`14`), the `data-pm` contract
     (`12`)
   Which of these are worth a test, and what is the rule that decides — rather
   than a list that decays the moment a module is added?

3. **What does the parity gate provably not see?** `13` diffs rendered routes.
   A pure function whose output is identical under both old and new
   implementations passes the gate by construction; so does a branch no route
   exercises (`09`'s stale-serve path, `16`'s `notFound()` guard on
   `/og/<anything>.png`). Name the blind spots, because they are the only
   argument for a harness that the gate does not already answer.

4. **If yes: what shape?** `packages/registry` already runs vitest — does
   `apps/web` join that setup, or get its own? Server-only modules using `fs`
   need a Node environment while anything touching React needs jsdom/browser;
   `06` and `08` put React in scope. Where do test files live, and does
   `pnpm test` at the root pick them up?

5. **Does CI run it, and does it gate the cutover?** `18` declined a CI gate on
   performance for a named reason (no stable environment, no number to fail on,
   and `13` had put performance outside the gate). `09` moved CI to a hermetic
   fixture. Whether unit tests gate the merge is a different question with a
   different answer, and it needs stating rather than assuming.

6. **What does the spec record?** The destination is a locked design spec. If
   the answer is (b) or (c), the spec must say so explicitly — an absent harness
   that nobody decided is a hole; an absent harness that was decided is a scope
   boundary.

## Resolution — ruled out of scope

Not decided on the route; **scoped out** of this effort by the dev on 2026-09-19:
"20'yi es geçelim, en son bütün işler bittiğinde bakarız." The destination is a
locked migration spec, and a standing test harness for `apps/web` is a practice
decision that outlives the cutover. It returns as its own effort after the
migration ships, not as a resumption of this map.

The investigation had already run, so its facts are recorded here rather than
discarded. The next effort starts from them instead of re-deriving them.

### Provisional answers, approved in conversation before the scope ruling

These were agreed and then superseded by the ruling above. They are **not**
binding decisions of this map; they are the running start for the later effort.

1. **Which blind spots would be worth closing:** the pro-manifest shape
   validation and `08`'s search matcher. Interaction logic (`03`'s sidebar group
   state, `17`'s scroll-spy, `07`'s theme bridge) deliberately left to `13`'s
   sampled human review — those failures are visible on sight, which is what
   sampled review is good at.
2. **Instrument:** vitest in `apps/web`, minimal. The repo already runs vitest
   4.1.11 in two workspaces; writing these as `.mjs` gate scripts would mean
   hand-rolling assertions and a runner that already exists in the monorepo.
3. **`13`'s own gate tooling would get narrow fixture tests.** Its extractors are
   new untested code whose worst failure is a **vacuous pass** — an extractor
   returning nothing diffs clean against an extractor returning nothing, and that
   single failure invalidates every other gate on the map at once.

### Facts established (these do not expire)

**`13`'s parity gate is differential, and that shape has exactly four holes.**
It compares old Astro output against new Next output across an inventory of
*live* routes. `19`'s six-path negative list already closed two of them (`09`'s
`notFound()` and `16`'s OG registry-lookup guard). The remaining three:

- **Nothing anywhere executes the stale-serve path.** `09` made CI hermetic on
  `lib/pro-manifest.fixture.json` and moved the live signal to a scheduled
  canary — but the canary watches the manifest, not the behaviour.
- **`08`'s matcher and index are invisible by construction.** The inventory is
  101 HTML + 74 text + ~102 OG + 247 registry JSON; the 113 KiB search index is
  none of those, the palette renders on no route, and Blume's Orama dialog is
  gone so there is no old side to diff against. `08` handed `13` only an
  intended-diff note about deep links.
- **The gate's own extractors are untested.** See provisional answer 3.

**Stale-serve is not our code, so it is not unit-testable.** `09` decision 2
says no code is needed — the behaviour is Next's Data Cache semantics during
revalidation. Vitest cannot exercise it without running Next. What *is* testable
is what stale-serve depends on: `parseManifest` is a **pure function with 11
distinct throw sites** (empty groups, duplicate ids, unknown group/category
reference, reserved `preview` id, non-https cover src, non-positive
`previewHeight`, unknown lucide key, …) and `loadProManifest` is a thin fetch
wrapper with one non-200 branch. The real failure mode is a validation that
*silently passes* a malformed manifest — stale-serve then never triggers and a
wrong `/blocks` publishes. Any future spec must say that stale-serve itself is
asserted by `09`'s truth table and the canary, **never** by a test.

**Repo shape.** `apps/web` has no `test` script and no vitest.
`packages/registry` runs vitest 4.1.11 / jsdom / testing-library over 66 files;
`packages/presets` has its own config. Root `pnpm test` names the two filters
**explicitly**, so a third workspace is not picked up automatically — it is a
one-line edit. CI runs `typecheck -> check:registry -> test -> build ->
test:smoke`.

**All three candidate test subjects are pure Node.** Manifest parsing, the
search ranking ladder and the parity extractors touch `fs`, `fetch` and strings;
none render React. A harness here would need `environment: "node"`, not the
jsdom setup `packages/registry` uses.

### Questions left genuinely open

Never put to the dev, and the later effort must not assume them:

- The **rule** that decides what gets a test, rather than a list that decays.
  The candidate on the table was "a module gets a test when its failure is
  invisible to a rendered route" — two forms: pure logic with no route-visible
  output, and a branch no route executes.
- Whether the harness **gates CI** or is advisory, and where the parity tooling
  physically lives (`13` says `scripts/route-inventory.mjs` at the repo root,
  which no `apps/web` vitest can see — a seam that needs deciding, and possibly
  a correction to `13`).
