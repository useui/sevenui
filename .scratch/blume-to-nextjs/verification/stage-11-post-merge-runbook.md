# Stage 11 — post-merge runbook (Task 11.6)

**Nothing in this file has been run.** Every step needs a merge to `main` and a production deploy,
and both are human gates (Ruling 132). It is written so that whoever holds those gates can execute
it afterwards without re-deriving anything: each step carries its command, the value it must
produce, and what to do when it does not.

Results go back into `.scratch/blume-to-nextjs/verification/stage-11.md`, which currently records
this proof as **not run and not runnable** and points here.

## Before anything — preconditions and the values to record first

| | |
|---|---|
| merge | `main` has **exactly one** merge from `feat/blume-to-nextjs` |
| deploy | the production deployment for that merge reports `success` |
| env var | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in the Vercel project (§22 row 3 — the one item nothing in the repository can verify, and a missing value is **silent**) |
| origin | `PROD=https://sevenui.dev`. No bypass header is needed; the 11.1 scripts still require `VERCEL_BYPASS` to be non-empty, so export any placeholder |
| tools | `gh` authenticated; `vercel` CLI logged in and linked to the project |

Record these **before** touching anything, because Step 2's proof is a comparison against them:

```bash
# 1. The production deployment ID. Use ONE field and use the same one afterwards.
vercel ls --prod            # or: Vercel dashboard -> Project -> Deployments -> Production
vercel inspect <deployment-url>
#    Do NOT use `x-vercel-id` from a response header as the deployment ID; it is a
#    request identifier. If you use a header at all, record the exact header and value.

# 2. /blocks's current category set, from the site rather than from memory.
curl -s "$PROD/blocks" | grep -o 'href="/blocks/[a-z0-9-]*/[a-z0-9-]*"' | sort -u

# 3. The manifest the site is reading, for the same reason.
curl -s https://pro.sevenui.dev/r/pro-manifest.json \
  | python3 -c 'import json,sys; m=json.load(sys.stdin); print(len(m["groups"]))'
```

**The baseline as measured on 2026-09-21**, for comparison rather than as an expected value — the
whole point of Step 2 is that this set grows without a deploy:

- **4 groups** — `application`, `marketing`, `ai-and-agents`, `ecommerce`
- **19 categories** — application: `account`, `app-shell`, `auth`, `dashboard`, `empty-state`,
  `profile`, `stats`; marketing: `contact`, `cta`, `faq`, `feature`, `footer`, `hero`,
  `logo-cloud`, `pricing`; ecommerce: `coupon`, `product-category`, `product-detail`;
  ai-and-agents: `ai-chat`
- **113 items**, manifest **46,487 B** raw
- **24 ISR routes** = 1 index + 4 groups + 19 categories

---

## Step 1 — re-run the gates against production

Same instruments, new origin. **Anything that passed on the preview and fails here is a
deployment-configuration problem, not a code one** — the code is byte-identical to what the
preview served. Start with the env var and the framework preset before reading any diff as a
regression.

Run from the repository root, on the merge commit.

```bash
export PROD=https://sevenui.dev
export PREVIEW_URL="$PROD"        # the 11.1 scripts read this name
export VERCEL_BYPASS=none         # required to be set; unused against production
export SDD=.superpowers/sdd/2026-09-19-blume-to-nextjs
export GATE=.scratch/blume-to-nextjs/verification/gate-prod
mkdir -p "$GATE"
```

### 1a. Inventory — regenerate, never reuse

```bash
node scripts/route-inventory.mjs > "$GATE/inventory.json"
```

**Expect** the five arrays disjoint and summing to `total`. It will read **110** only if the pro
manifest has not moved; **a different total is not a failure** — it is the migration working, and
every gate below takes this file as its domain rather than a number.

### 1b. The six negative paths

```bash
node "$SDD/task-11.1-negative.mjs" "$GATE" "$GATE/negative-paths.json"
```

**Expect** `allSix404=true allSixBodyAsDeclared=true allControls200=true`, predicate cross-check
`pass: true`, and the same six classes:

| path | class | text / h / links |
|---|---|---|
| `/docs/components/definitely-not-a-primitive` | SHELL_46 | 0 / 0 / 0 |
| `/components/definitely-not-a-component` | REAL_BODY | 475 / 1 / 33 |
| `/blocks/marketing/definitely-not-a-category` | SHELL_46 | 0 / 0 / 0 |
| `/og/definitely-not-a-route.png` | IMAGE | — |
| `/definitely-not-a-page` | REAL_BODY | 475 / 1 / 33 |
| `/components/field` | REAL_BODY | 475 / 1 / 33 |

**If a SHELL_46 path comes back REAL_BODY:** that is vercel/next.js **#98954** fixed upstream.
Good news, not a failure — §17.6 #46 says it self-resolves. Close the row with the date.
**If a REAL_BODY path comes back SHELL_46:** a new route family joined the defect. Find which
boundary changed before anything else.
**If any path returns 200:** stop. §17.4's inverted risk ("200 with a plausible fallback") has
arrived, and a `loading.tsx` or a page-rendered 404 body is the usual cause.

### 1c. Registry JSON — byte-identical to what `main` served before the merge

The comparison's "old" side stops existing at the merge, so use the pre-merge base rather than the
new `main`:

```bash
git worktree add /tmp/pre-merge-registry dbe9ee4
( cd /tmp/pre-merge-registry && pnpm install --frozen-lockfile && pnpm build:registry )
node .scratch/blume-to-nextjs/verification/gate/scripts-11.2/registry-gate.mjs \
     apps/web/public/r /tmp/pre-merge-registry/apps/web/public/r "$GATE/registry-gate.json"
git worktree remove /tmp/pre-merge-registry
```

**Expect 5/5**: 247 files each side, 244 byte-identical, 3 differing — `demo/chart-demo.json`,
`demo/chart-line.json`, `demo/field-validation.json` — each with the `"use client"` directive once
here and zero times there, reversing to byte-identical at a delta of 19 B.

Then confirm production actually *serves* them, which the file comparison does not:

```bash
curl -s "$PROD/r/button.json" | head -c 80
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' "$PROD/r/demo/chart-demo.json"
```

**If a fourth file differs:** that is a real regression in the registry build, not a hoisting
artefact — a hoisting difference shows on all 247 (proven in 11.2, where the two `node_modules`
trees differed 2 against 11 top-level entries and the output did not move).

### 1d. The agent and SEO fixtures (Stage 8's gate)

```bash
node "$SDD/capture-stage8.mjs" remote "$GATE/stage8" "$PROD" ""
EXPECT_BLOCKS_ROUTES="$(python3 -c 'import json;print(len(json.load(open("'"$GATE"'/inventory.json"))["blocks"]))')" \
  node "$SDD/stage8-gate.mjs" "$GATE/stage8"
```

**Expect 30/30**, 156 URLs, **0 unintended non-200s** (4 non-200 are the capture's own named
negatives: `/docs/index.md`, `/docs/components/button.mdx`, `/docs.mdx`,
`/docs/components/nonexistent`). `robots.txt` 120 B byte-identical; `llms.txt` === `index.md` at
14,186 B; the fixture an in-order subsequence with all 78 lines consumed.

**Never hard-code the blocks count** (Ruling 58) — pass it from the inventory, as above, or the
gate will fail the first time pro publishes a category and blame the site.

### 1e. The OG sweep

```bash
node scripts/og-sweep.mjs --inventory "$GATE/inventory.json" --base "$PROD" --save /tmp/og-prod.json
node scripts/og-sweep.mjs --load /tmp/og-prod.json --controls
```

The `--save` capture holds every route's raw HTML and runs to tens of megabytes — write it outside
the repository, as above.

**Expect 45/45 assertions and 51/51 controls**, `swept N + notFound 1 = total` reconciling with
the inventory, `0 routes excluded from the card-content law`. No control may print `DEAD` or
`INDETERMINATE`.

**If the card layer fails but the tag layer passes:** the font read is at module scope, so a font
missing from the deployed bundle fails module initialisation and surfaces as a **500**. A 404 on a
card slug is the correct answer for an unknown slug; a 500 on a real one is a bundling problem.

### 1f. The extractor over a sample of each surface

```bash
for r in / /docs /docs/components/button /components /components/dialog \
         /blocks /blocks/marketing /blocks/marketing/hero /pro /account /terms /privacy; do
  node scripts/extract-page-features.mjs "$PROD$r"
done
```

**Expect** every one non-vacuous. The CLI guard throws `vacuous extraction: … produced no text, no
headings and no links` — which is the single most important failure in this whole runbook, because
a vacuous extractor diffs clean against a vacuous extractor and would make every other gate above
meaningless (§21 blind spot 3).

Optionally re-run the full differential gate against production as the new side. Its value after
the merge is limited: production *is* the new side, and the old side's corpus
(`verification/gate/old/`, 110 documents of a site that no longer exists) is committed precisely
so the comparison stays reproducible.

---

## Step 2 — the one thing the cutover must prove, beyond parity

**A category added to the pro manifest appears on the site without a rebuild.** That is the entire
reason this migration exists (§2, §10, §17.1, §22). Parity is the price of admission; this is the
purchase.

It **cannot be simulated**. It needs a real pro-repo manifest change, so it cannot be run from the
web side alone and could not be run before the merge at all.

1. **Record the baseline** — the deployment ID and the `/blocks` category set, from the "Before
   anything" section above, with a timestamp. Do this first; a comparison against a value read
   afterwards proves nothing.
2. **Have the pro repo publish a new category.** If none is pending, a temporary one is fine —
   it can be withdrawn after the proof.
3. **Do not dispatch `trigger-web-rebuild.yml`. Do not deploy the web app.** If either happens,
   the run is void and must be started again from the baseline: a rebuild makes the new category
   appear for the ordinary reason and proves nothing about ISR.
4. **Wait past 300 s** (the revalidate window), then reload:
   ```bash
   curl -s "$PROD/blocks"        | grep -c 'blocks/<group>/<new>'
   curl -s "$PROD/blocks/<group>" | grep -c '<new>'
   ```
   The new category **must appear in both listings**.
5. **Follow the link** to `/blocks/<group>/<new>`:
   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' "$PROD/blocks/<group>/<new>"
   ```
   It **must render 200 via `dynamicParams`**, not 404. This is the half a listing check cannot
   cover — `dynamicParams` is what turns a manifest entry into a page that did not exist at build
   time, and it is why `dynamicParams = false` was rejected for `/blocks` in Ruling 115.
6. **Confirm the production deployment ID is unchanged** — re-read it exactly as in step 1, from
   the same field. **That is the proof.** A changed deployment ID means something rebuilt, and the
   run is void.

**Record in `stage-11.md`**: the deployment ID before and after, the timestamps of the manifest
publish and of each successful reload, the category slug used, and the two status codes.

### If it fails

| symptom | first thing to check |
|---|---|
| the category never appears, however long you wait | `PRO_MANIFEST_URL` on the production build — if it is still the CI fixture (`lib/pro-manifest.fixture.json`), the site is reading a frozen file and no manifest change can ever reach it. §22 row 4 scopes that variable to the **build step** only |
| the listing updates but `/blocks/<group>/<new>` 404s | `dynamicParams` on the `/blocks` route segments. `prerender-manifest.json` should show `fallback: null` / `compute: "blocking"` for the blocks routes, against `fallback: false` for `/components/[name]` |
| it appears immediately, with no wait | the page is not being cached at all. Better than the failure, but it is not the mechanism §10 describes; check the route's `revalidate` |
| the deployment ID changed | something triggered a build. Find what, revert the trigger, and re-run from the baseline |
| the manifest itself is malformed | `node scripts/check-pro-manifest.mjs` — and note §21's blind spot 1: `parseManifest`'s real failure mode is **silently passing** a malformed manifest, after which stale-serve never triggers and a wrong `/blocks` publishes. A green canary is weaker evidence than it looks |

---

## Step 3 — sign off the §20.1 bridge

Open a note wherever this project tracks follow-ups, naming the condition **verbatim**:

> **Delete the `blume-theme` mirror write once the pro repo reads `theme`.**

The write site is `apps/web/components/theme-provider.tsx:36`
(`localStorage.setItem("blume-theme", resolvedTheme)`), and the condition is repeated in a comment
at lines 21–29.

**Nothing automated can observe this.** It is the only item in §20 with no verdict and it
structurally cannot have one — its removal condition is a fact about **another repository** that
nothing here can read. Every other line in §20 has something that will eventually contradict it;
this one has only a person who remembers, which is exactly why it is the item most likely to
outlive its purpose.

While the note is open, check the figure in the comment itself. At HEAD `49ae775` it says "16
pages" where §20.1 says **24 routes as of 2026-09-21**; a repair re-deriving it as a rule was in
the working tree when this runbook was written, so confirm which version merged rather than
assuming. The removal condition is unaffected either way.

---

## Step 4 — note the deferred follow-ups, without opening work

From §19. Each is deliberately **not** done and each is a separate future effort. Write them down;
do not start them.

- **Geist for the site** (§11.2) — ~3 lines against the single seam §11.2 creates. Cost is not the
  reason; attributability is.
- **The theme dock on `/components` and the docs pages** (§8.4) — a pre-existing product gap, not
  migration parity, and its behaviour there is its own design work.
- **On-demand `revalidateTag` for the manifest** (§10.5).
- **A runtime test harness for `apps/web`** (§21) — start from
  `.scratch/blume-to-nextjs/issues/20-runtime-test-harness.md`. The highest-value first target is
  named there and above: `parseManifest`, a pure function with 11 throw sites.
- **The pro repo reading `theme`**, and **`/r/theme.json` gaining `registryDependencies`** so
  `text-success` / `bg-warning` resolve for consumers (§8.6). Both are pro-repo changes; the first
  is Step 3's bridge.
- **Post-cutover 404 niceties** (§11.7) — `not-found` boundaries for the gallery and `/blocks`,
  and redirects for the base-less legacy shapes `/installation` and `/theming`.

**`robots.txt`'s `Content-Signal` stance gets no follow-up at all — it is settled, not deferred.**

---

## Step 5 — four things Stage 11 adds to this list

These are not in the plan's Task 11.6. They exist because Stage 11 measured something it could not
close before the merge.

### 5a. The manifest canary's first scheduled run — §22 row 5, unsatisfiable until now

`manifest-canary.yml` has **never run**, and could not: GitHub resolves both `schedule:` and
`workflow_dispatch` against the **default branch's** copy of a workflow file, and `main` had none.
Reproduced twice, from two directions:

```
$ gh workflow run manifest-canary.yml --ref feat/blume-to-nextjs
HTTP 404: workflow manifest-canary.yml not found on the default branch

$ git ls-tree origin/main .github/workflows/
ci.yml                        # and nothing else
```

The merge is what makes it exist. Its schedule is `17 */6 * * *`.

```bash
gh workflow list --all                    # manifest-canary should now appear
gh run list --workflow manifest-canary.yml --limit 5
```

**Confirm one run has succeeded.** Until one has, the only live signal watching the pro manifest's
shape does not exist — on a surface whose ISR stale-serve is precisely what would keep a failure
quiet. If it fails on its first run, read it as a real signal: it runs against the **live**
manifest, unlike CI's fixture.

### 5b. The CI guard's first execution on a runner

`ci.yml`'s `node scripts/check-pro-manifest.mjs …` step (Ruling 98, commit `0b9c9bd`) has never run
on GitHub either: `ci.yml` triggers on `push: branches: [main]` and `pull_request`, there was no PR
and `main` was untouched. **The cutover PR is its first execution**, and the `push: main` run at
merge is its second.

It is proven locally, in both directions, including with the `lucide-react` symlink renamed aside
so the guard was seen to fail on its own axis. Watch that first runner execution; a green local
proof and a green runner are different claims.

### 5c. The `.static` sweep's follow-up guard — and its hard requirement

The invariant *"no utility token appears only in prose"* is about one ~40-line script away from
being asserted on every build, using the `@tailwindcss/oxide` scanner the build already depends
on. It was deliberately **not** added at the cutover gate (Ruling 126): a new CI check added to the
cutover PR buys a guard at the cost of the one signal that must stay legible.

It is worth building afterwards, because without it the sweep's result is contingent on a tokenizer
detail — three occurrences (`static,` with a trailing comma at `code-block.tsx:113`,
`preset-scope.tsx:70`, `sidebar.tsx:179`) are dead only because punctuation invalidates the
candidate, and a Tailwind bump reopens the defect with nothing to notice.

**The requirement, verbatim from Ruling 129, and it is the whole lesson:**

> **Any guard built from this must be per-extension MDX-aware, or it ships the exact defect it
> prevents while carrying the authority of a green check.**

Three instruments with three separate implementations shared one blind spot in Task 11.0b, because
all three asked a TypeScript question about a file set that includes MDX — and MDX has no comments,
so prose tokens there scored as real usage. A guard with that blind spot would be worse than no
guard.

Known survivors it must be able to classify, and which stay by decision rather than by oversight:
`.blur` and `.invert` (~431 B) plus eleven utility names quoted verbatim in rendered docs prose
(~520 B) — `animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up`, `basis-1/3`,
`max-h-[var(--available-height)]`, `aria-[orientation=vertical]:flex-col`, `fade-in-0`,
`zoom-in-95`, `text-success`, `bg-warning/10`. The docs exist in order to name those utilities.

### 5d. §17.6 #36's deferred remedy is now due

#36 — the docs `<aside>` nested inside `<main>` — is a declared **regression** whose remedy was
deferred **"past cutover"**. The cutover is the event it was deferred past, so the deferral has
expired and the item has no owner and no date. Give it both.

Its mirror image, **#49**, is the same mechanism pointing the other way: the drawer `<aside>`
*leaves* `<main>` on every non-docs route, which is an improvement. The two reach disjoint sets —
#36 the 69 docs routes, #49 everything else — which is why they are separate rows and why fixing
#36 is a bounded change rather than a landmark reshuffle.

---

## What this runbook still does not cover

- **Clerk.** §17.7 excludes anything behind it beyond "`/account` loads and lists licenses", and
  the preview never had a usable key — Clerk's production instance answers `400 origin_invalid`
  off a preview origin. After the merge, the **first** proof that Clerk works is a human signing in
  on production. Do that early; a missing env var is silent.
- **The four-view human look** at the pixel-near surfaces. Ruling 105 records that the pixel-near
  set was **measured and not seen** — the human was away for the whole chain — and the review
  matrix is what found the 16 px docs `<h1>` that nine stages of text gating could not. A person
  should still look at `/` and `/blocks` in both themes.
- **The performance numbers.** §18 is a recorded measurement and gates nothing. The port's own
  first measurement is the budget a later run is compared against — not Astro's.
