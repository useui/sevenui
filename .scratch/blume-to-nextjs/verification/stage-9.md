# Stage 9 — OG cards. Verification record

Branch `feat/blume-to-nextjs`, commits `621af2c..9ef497a`. `main` untouched, no PR.
Preview: `sevenui-git-feat-blume-to-nextjs-oguzhan-yilmaz.vercel.app`.

```
21d2b13 feat(web): render OG cards from a catch-all route, drawn from each page's own words   (9.1 + 9.2)
9d7c49f docs(spec): date §17.6 #3's manifest-derived count and widen #28 to the 404's head
3f6c62b feat(web): declare the full og/twitter/canonical set on every route, from one builder (9.2b)
3d214de fix(web): give the docs 404 boundary its own metadata                                  (9.4)
9ef497a test(repo): sweep every OG card and diff the card's input                              (9.3)
```

## The gate — `node scripts/og-sweep.mjs --inventory <route-inventory.json> --base $PREVIEW`

**45/45 assertions passed. 51/51 positive controls went red on their own target. Every one of the
45 assertions is recorded and is named as some control's target** — 33 named assertions plus 12
generated relation assertions, both inventories declared as data and validated at load.

(Earlier drafts of this record said "20/20 checks / 28/28 controls", then "38/38 assertions /
45/45 controls". Those were the gate before, and midway through, the corrections described under
"Why the unit is an assertion" below. The behaviour never changed: 45 assertions say what 20 checks
said, with none of them able to hide a deleted half.)

| layer | checks |
|---|---|
| cards (§17.5 layer 1) | 200; `image/png`; above the 8 KB floor; PNG signature; IHDR 1200×630; **card bodies agree exactly where the page's words agree and differ everywhere else**, with both witness classes asserted non-empty; routes at or past the renderer's 64/160 draw caps are **excluded from that law and named and counted in the output** rather than failing it (longest live title 23, longest description 154) |
| tags | every route answers 200; the declared set is exactly 10 `og:*` + 5 `twitter:*` + the canonical link, each once (set equality, not a subset test); no such tag emitted outside `<head>`; **each of the 12 self-consistency relations is its own assertion with its own control**, × 109 routes; `og:image` is the absolute form of the route's own card and that card is one layer 1 proved; `og:url` carries the trailing slash on `/` and on no other route |
| input diff (§17.5 layer 2) | every route has a registry side; `og:description` matches it **byte for byte** on all 109; `og:title` matches under the route's own title rule — **three rules, not one**: root-bare 1, gallery-components 10, suffixed 98 |
| inventory | `swept 109 + notFound 1 = 110` reconciles with `route-inventory.mjs`'s own total |
| negative (§17.4) | 5 unknown card slugs answer 404, not a generated image; all six §17.4 missing pages 404, declare the reduced 7-tag set, **and carry the right values in it** — `og:title` = `twitter:title` = `Page not found — SevenUI`, descriptions the site description — for `/not-a-page`, `/docs/not-a-primitive`, `/components/not-a-component`, **`/components/field`**, `/blocks/not-a-group`, `/blocks/marketing/not-a-category` |

The gate is HTTP-only: its only imports are `node:fs/promises` and `node:crypto`'s `createHash`, which is what every card body hash is computed with. It reaches no application module. Its registry side is `/llms.txt`
for 104 routes and a literal restatement for the 5 it omits (`/`, `/account`, `/privacy`, `/pro`,
`/terms`), whose values were measured against **production**, not copied from `lib/page-meta.ts`.
The split is printed on every run; a route with no registry side, two, or a stale table entry each
fail their own check.

## Why the unit is an assertion, and how it got there

**On the controls.** Every mode names the assertion it guards and must take that assertion from
**green to red**; anything else prints `DEAD` or `INDETERMINATE` and exits non-zero. The gate
reached that property in three corrections, each found by deliberately breaking it — never by
reading it.

1. The first version declared a mode live on **any** red line. The task reviewer gutted checks into
   no-ops and the gate reported a clean sweep *and* a clean control run with §17.5's headline check
   and the gallery-title rule both deleted. Fixed by naming a target per mode; the same experiment
   now prints `DEAD cardstatus / DEAD title / DEAD galleryrule / DEAD rootrule`.
2. Naming a target per **check** was still not enough, because a check could conjoin many
   assertions. Deleting eleven of the twelve tag relations — the eleven that include the
   `og:image:width`/`height` pair `lib/og/dimensions.ts` exists to protect — left the gate printing
   a perfect score and its own coverage sentence. Fixed by making the unit an assertion.
3. **Naming a target per assertion was still not enough while an assertion could conjoin two
   independent facts.** Five `record()` calls did — including the two that assert a 404's
   `og:title`/`twitter:title` and `og:description`/`twitter:description`, the very rows §17.6 #28
   names. Deleting the `twitter:` half of either left a perfect score and the full coverage
   sentence, while nothing else in the repo asserts a 404's `twitter:title` at all. The rule that
   came out of it is narrower than "never conjoin": **every branch of a predicate needs a control
   that fails only through that branch.** Where that already holds, the record count does not
   matter; where it does not, splitting is the cheapest fix.
4. **Generating one control per assertion made it worse, and this is the stage's sharpest finding.**
   With the controls derived from the assertions, deleting an assertion deleted its control too, so
   the ratio stayed perfect while the coverage collapsed — and the sentence stayed *true*. A
   coverage claim computed from the code it audits can always be satisfied by deleting that code.
   The inventories are therefore written out as data (`DECLARED_CHECKS`, `DECLARED_RELATIONS`) and
   validated at load by a throwing `requireSameSet`, so that experiment now dies before a single
   fetch — and a deleted assertion is caught a second way, as a name that is still declared and
   still targeted but never recorded.

**What this does and does not buy.** Seven attacks were run against the final scheme by the
re-reviewer: deleting an assertion, deleting its control, deleting both, renaming one side, and
gutting a predicate are all caught — by a load-time refusal or by a `DEAD` verdict, exit 1. A
**coordinated** edit to the assertion, its control and the declared inventory still passes, as it
must; what the declaration buys is that an invisible deletion becomes a deliberate one and the
printed counts move. The scheme is a tripwire, not a proof, and the file says so.

## §17.5 layer 3 — the fixed six-card review

Landing, one docs primitive (`button`), one docs guide (`theming`), one gallery page (`dialog`), one
block category (`blocks/marketing/hero`), one legal page (`terms`) — each fetched from the preview
and compared against its production counterpart. Composition matches on all six. The only vertical
difference, on the docs primitive, is the content block settling lower because our description is
one line where production's was two; pairs with equal line counts have matching baselines.

**Performed by the controller, not by a person** — the human was away for this chain. Recorded as
such so a reader knows what kind of eye it was.

## §17.6 rows this stage closes

- **#3** — every `/blocks` group and category page stops declaring a 404 `og:image`. Production
  404s both `/og/blocks/marketing.png` and `/og/blocks/marketing/hero.png`; all 24 blocks routes now
  pass every card check. The row's "17" was wrong in size *and* shape (3 of them were group-level);
  it is rewritten with the number dated — **23 as of 2026-09-21**.
- **#21** — OG card descriptions are per-page across all cards, proved by the byte-for-byte
  `og:description` diff on all 109 routes rather than by inspection.
- **#28** — widened: the 404's suffixed `<title>` moves its `og:title`/`twitter:title` with it, and
  the rest of that head is production's reduced seven-tag set.

## The defect the gate found on its first repaired run

Every `/docs/*` miss shipped `<title>SevenUI</title>` and **zero** `og:*`/`twitter:*` tags, where
production ships `Page not found` and seven. Next resolves a `notFound()` render from the nearest
`not-found.tsx` boundary's own metadata and discards the originating route's `generateMetadata`
result; `app/docs/not-found.tsx` exported none, so the root layout's default title stood. `/blocks`
was already correct precisely because it has no boundary of its own and bubbles to the root's.

It had been on the branch since Stage 2 and no gate had seen it, because **no gate before this one
read a 404's head**. A missing page is the one surface a route inventory cannot enumerate — which is
why §17.4 fixes its negative list by hand, and why the three entries of that list which had no owner
(a docs miss, a gallery miss, `/components/field`) were given one in the same round.

## Other measurements taken this stage

- `pnpm -r typecheck` clean across all three workspace packages. Registry suite **525/525**.
- `node scripts/route-inventory.mjs`: docs 69 / gallery 11 / blocks 24 / standalone 5 / notFound 1 =
  **110**, so **109 cards**. The plan's "~102 (85 + 17 block)" was two stages stale.
- Cards measure **29,362–54,408 B** (Satori/resvg against Blume's Takumi, which produced 15–18 KB).
  §16 disclaims pixel parity; the 8 KB floor sits well below the real minimum.
- Every runtime 404 carries exactly one `<meta name="robots" content="noindex">`, including the two
  reached through `dynamicParams` — the case Task 1.9 left unobserved.
- **`/og/index` — the extension-less slug, not `/og/index.png`** — and the four other unprerendered
  misses answer **404, not 500**, over the wire. The font read is at module scope, so a font missing
  from the deployed bundle would fail module initialisation and surface as a 500; the 404 proves
  `readFileSync(process.cwd() + …)` resolves inside the lambda. The route's `.nft.json` lists both
  `.ttf` files among its 847 traced entries. (`/og/index.png` is `/`'s real card and answers 200 /
  `image/png` / 38,119 B; an earlier draft of this line named the wrong one of the two.)
- **The cards are prerendered, which `dynamicParams: true` otherwise hides.** A
  `generateStaticParams` returning nothing would leave every card answering 200 on demand and the
  gate blind to it. Confirmed from the build's route table: **109 `/og/[...slug]` paths under
  `● (SSG)`**. §16.7's entire cache argument rests on this and nothing had checked it.
- **Production's missing cards re-confirmed over the wire on 2026-09-21**, rather than carried from
  a stage-earlier measurement: `https://sevenui.dev/og/blocks/marketing.png` and
  `/og/blocks/marketing/hero.png` both 404; `/og/index.png` and `/og/terms.png` both 200.

## The comparison the gate does not make, run once by hand

The gate is a **self-consistency** test: it compares the preview's HTML against the preview's own
`/llms.txt`. If the whole site's words drifted away from production together, it would stay green.
So the whole-stage reviewer ran the comparison the gate cannot — **production against the preview,
all 109 routes, 17 head fields each**:

> **341 differing lines. 340 of them are §17.6 #17's hyphen → em dash (68 routes × 5 fields), and
> one is `/docs/components` being 404 on production (#26). Every other declared value, on every
> route, is byte-identical to production — `/`'s trailing-slash `og:url` included.**

That is the strongest single piece of evidence for the tag-set claim, and it produced a spec
correction of its own: #17 and §15.9 each named three surfaces for a change that reaches five, the
two `twitter` fields having been suffixed all along — first as Next's implicit fallback, now
explicitly. Both were rewritten and dated.

## A second reader on the cards

§17.5's six-card layer was performed by the controller (above). The whole-stage reviewer
independently read four preview cards against their production counterparts and agreed: composition,
logomark placement, headline and description baselines, rule and footer effectively identical;
`/og/components/button.png` drawing bare "Button" with the gallery's own sentence where production
drew "Button" with the site-wide one (#21); `/og/terms.png` drawing "Terms of Service" where
production drew "Terms" (§16.1's fix); `/og/blocks/marketing/hero.png` drawing "Hero blocks" where
production 404s (#3). Recorded because the claim had rested on one pass by one reader.
