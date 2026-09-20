# Stage 6 — Clerk, `/account`, `/pro`

Branch `feat/blume-to-nextjs`, HEAD `4a74b4d`, pushed. `main` untouched, no PR.
Preview: `sevenui-git-feat-blume-to-nextjs-oguzhan-yilmaz.vercel.app`. **111 routes** (109 + `/account`
+ `/pro`), all static.

Four tasks, not the plan's three. The fourth — the header's auth pill — was Stage 6 scope by the
placeholder comment in `components/site-header.tsx`, by the Stage 1 ledger entry, and by §12.2's
three-caller list, and it was closing a gap nothing had declared: `grep -c 'Sign in'` on
`/docs/installation` returned **production 1, preview 0**.

## Commits

```
0f4e34a refactor(web): gate Clerk on the client hint inside lib/clerk.ts        (6.1)
eefd41e feat(web): fill the header's auth pill slot                             (6.1b, unplanned)
8e68b25 docs(spec): declare §17.6 #43 — /account's retry is repaired
b363ea6 refactor(web): let the Clerk hint gate answer before you await it       (6.2 review fallout)
2c6dd4f feat(web): render the signed-out account state on the server            (6.2)
4a74b4d feat(web): port /pro with Clerk behind the client hint                  (6.3)
```

## Definition of done

| Item | Result |
|---|---|
| `/account` and `/pro` render | ✅ both static (`○`), route total 111, `prerender-manifest.json` confirms `"compute":"static"` for both |
| `middleware.ts` does not exist | ✅ `ls apps/web/middleware.ts` → not found |
| `@clerk/nextjs` not installed | ✅ only `"@clerk/clerk-js": "^6.31.0"` in `apps/web/package.json` |
| **An anonymous visit to either page issues zero Clerk requests** | ✅ and **non-vacuously** — see below |
| `/account`'s three failure surfaces independently reachable | ⚠️ one of three verified live; the other two are structural and blocked by the preview origin — see below |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is the only env var in `.env.example` | ✅ it is, and it was already renamed before this stage |
| …and it is set in the preview environment | ❌ **it is not.** Measured, not inferred. See "The env var" |

## The zero-request proof, and why it is not vacuous

`pw/stage6-clerk.mjs`, run against the live preview: **11 checks, 0 failing**
(`stage6-verify/stage6-clerk.json`).

A check that counts Clerk requests and finds none passes just as happily when the page 404s, when the
matcher cannot match, or when the deployment predates the feature. All three were live risks here and
two of them actually fired during development of the harness. So:

- **The matcher is a request-set diff, not a URL pattern.** Next names chunks opaquely
  (`163t4156hhou6.js`), so an earlier `/clerk/i` URL test could never match the one request that
  matters — it reported a clean sweep while measuring nothing, and only the positive control caught
  it. Each route is loaded twice, once anonymous and once with `__client_uat=1`, and what the hint
  path **added** is the gate's effect:

  | Route | anonymous | hinted | scripts added by the hint path |
  |---|---|---|---|
  | `/account` | 81 requests | 82 | `+ /_next/static/immutable/chunks/163t4156hhou6.js` |
  | `/pro` | 66 | 67 | the same one chunk |
  | `/docs/installation` | 69 | 70 | the same one chunk |

  One chunk, every time, and nothing else. That chunk is the 1.46 MiB Clerk bundle, and the cookie is
  the only thing standing between the anonymous visitor and it.

- **Every route asserts its own content before any count is believed.** An earlier run PASSed
  `anon/pro` on a deployment where `/pro` did not exist — a 404 issues no Clerk requests either.

- **The deployment is guarded.** The harness refuses to report unless the landed origin matches and
  `#auth-control` is present, which only exists as of Task 6.1b.

## The env var

**`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is not set in the Vercel Preview environment.** §22's row 3 —
*"A missing value is silent"* — is confirmed exactly as written: every page builds and renders, the
pill reads "Sign in", and the only trace anywhere is a console line.

A bundle grep cannot establish this. Next 16 compiled the read to a runtime shim lookup rather than
an inlined literal (`new r(t.default.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)`), so an inlined value
and an absent one look identical through that lens; downloading all 32 chunks of `/docs/installation`
and grepping `pk_live_|pk_test_` returns nothing, and that nothing proves nothing. The running page
was asked instead (`pw/stage6-probe-env.mjs`), where the candidate causes differ by content:

```
console: header:  Error: @clerk/clerk-js: Missing publishableKey. …
console: account: Error: @clerk/clerk-js: Missing publishableKey. …
requests to any clerk.* host: []
```

The key is missing, so `new Clerk(undefined)` throws before any Frontend-API call. **This needs a
human with the Vercel dashboard** — and see the next section for why setting the production key there
would still not buy a signed-in preview.

## The three failure surfaces

| Surface | Verified |
|---|---|
| Clerk **boot** failure → whole-page retry | ✅ **live**, through the ordinary code path. Screenshot: `stage6-verify/shots-stage6/account-hint-boot-failure.png`. Body carries `UNAVAILABLE_MESSAGE` and "Try again" |
| **licenses** failure → its own box, its own retry | ❌ needs a session |
| **identity / sign-out** resolving without licenses | ❌ needs a session |

The last two are not reachable from any preview deployment, and not because of this stage. Two
independent blockers stack:

1. The publishable key is unset (above), so Clerk throws before it reaches the network.
2. Even with a key, Clerk's **production** instance rejects the origin. Measured directly:

```
Origin: https://sevenui-git-feat-blume-to-nextjs-oguzhan-yilmaz.vercel.app  →  400 origin_invalid
Origin: https://sevenui.dev                                                 →  200
"The Request HTTP Origin header must be equal to or a subdomain of the requesting URL."
```

Session cookies live on `.sevenui.dev` besides, so they never reach a `vercel.app` request. §17.7
already places *"anything behind Clerk beyond `/account` loads and lists licenses"* outside the gate;
this stage narrows that further and says so. A `pk_test_` key from a Clerk **development** instance
in the Preview environment is the only thing that would open it — a choice for the human, not a task,
since preview sign-in has never worked on this project.

**What the failing origin bought instead:** the boot-failure path, normally hard to trigger, is the
*default* outcome of the hint path here. So it was exercised end to end, and with it both `catch`
blocks the port promises — the header pill degrades to "Sign in" on all three routes tested
(`header/degrades/*` all PASS) and `/account` renders §12.3's retry.

## `/pro`'s enhancement never damages the link

| Case | `#pro-buy` href |
|---|---|
| anonymous | `https://buy.polar.sh/polar_cl_EFc9Cc5sEoAjEz4MBrNwWu5UWgdnAMC0cRwyT2n1aZF` |
| hint cookie set, boot fails | identical |

No `customer_email`, no `reference_id`, no mutation. The signed-in happy path (both parameters
present) is carried to the cutover with the rest of the session-dependent work.

## §17.2 parity gate

Scoped to the routes this stage touched (§17.3), plus one site-wide check for the header change.

**Site-wide, all 109 navigable routes on both origins:** the auth pill and its `/account` link are
now present on **109 of 109** on both sides. That retires two of `stage5-gate.mjs`'s three owned
tokens — `OWNED_LINK = ["/account"]` is gone and `OWNED_TEXT` loses its `Signin` tail — leaving only
Stage 7's search run owned. A strictly stronger gate than Stage 5 ran.

**`stage6-gate.mjs` on `/account` and `/pro`: 2 routes, 0 failing.**

- **`/pro`: extracted text is byte-identical to production — 1725 characters against 1725**, headings
  equal, zero link differences in either direction. Independently, the task's reviewer diffed the
  complete text-node sequence of the live page against `.next/server/app/pro.html`: **34 of 34 nodes
  identical, whitespace included.**
- **`/account`: exactly §17.6 #13's footprint and nothing else.** Nothing removed; one contiguous run
  added, isolated to the character:

  ```
  ADDED: "Yourlicensekeyliveshere.Signinwiththeemailyoupurchasedwithtoviewandcopyyourkey
          —itunlockseveryProblockasthecatalogships.SigninNolicenseyet?Pre-order—$99"
  ```

  722 extracted characters → 873. The one link that run contains (`/pro ×1`) and the `<h1>` it
  introduces are the same diff seen through the link and heading inventories, and are declared in the
  gate rather than excluded from it. Production's static HTML is the skeleton; ours is the hero.

## Preview matrix

2 widths × 2 themes × 2 pages, anonymous — 8 screenshots in
`.superpowers/sdd/2026-09-19-blume-to-nextjs/stage6-verify/shots-stage6/`, plus the boot-failure view.
Hand-reviewed: hero, crop-mark frame, licence sketch, catalog grid, pricing band and footer all render
correctly at 390 and 1440 in both themes. Signed-in is out of the gate (above).

## §17.6 rows

- **#13** — `/account` renders its signed-out state server-side. Landed, and measured above.
- **#18** — `headline` bare on `/pro` and `/account`, the last 2 of 16. Landed: built HTML carries
  `"headline":"Pro"` and `"headline":"Account"`.
- **#43** — **new this stage.** `/account`'s whole-page retry is repaired: `lib/clerk.ts` memoised a
  *rejected* boot promise under `??=`, so production's retry button hands back the same rejection
  forever and visibly does nothing. Joins #34 as a row that repairs rather than reproduces, and #41
  and #42 as a row no gate in this plan can observe.

## Proof obligations

None, per the plan.

## Deferred minors, carried to the final whole-branch review

1. `account-panel.tsx` — `res.json()` body typed `any`; licence rows cast unvalidated (parity with
   `account.astro:267-268`).
2. `account-panel.tsx` — `disabled:opacity-60` on the sign-out and retry buttons; not in the source.
3. `account-panel.tsx` — the mount effect has no cleanup, so StrictMode's dev double-invoke runs its
   body twice. Harmless: idempotent writes, one `clerkPromise` singleton, no double boot.
4. `site-header.tsx` — the bare word `hidden` in comment prose; inert, `hidden` is a used utility in
   the same file.
5. `site-header.tsx` — the `cancelled` flag is checked twice in one callback.
6. `pro/page.tsx`, `buy-link.tsx` — bare `static` as prose in five comments. The reviewer measured the
   cost at **zero bytes**: the leak is repo-wide and pre-existing in ~30 files, and the built sheet
   already carries `.static{position:static}`. This is Stage 5's open thread #3 and belongs to that
   sweep in Stage 11.
7. `pro/page.tsx` — `catalogArt: Record<string, ReactNode>` gives up the exhaustiveness the replaced
   ternary had; a bad id renders a blank cell silently.
8. `buy-link.tsx` — two effects plus a ref where one effect with a local flag is StrictMode-safe by
   construction. Correct as written; it copies `account-panel.tsx`'s pattern past the reason that file
   needs a ref.
