# Clerk integration approach

Type: grilling
Status: resolved
Assignee: Oğuzhan (this session)

## Question

`/account` is the only authenticated surface. Today `apps/web` depends on
`@clerk/clerk-js` (not `@clerk/nextjs`), `lib/clerk.ts` wires it up, and
`pages/account.astro` (340 lines, one client script) renders it — loaded lazily
on the client, a shape arrived at deliberately (recorded as the "Clerk-lazy
trap"). Licenses come from the pro deployment through the
`/api/me/licenses` rewrite.

Settle:

1. **`@clerk/clerk-js` client-side, or `@clerk/nextjs`?** The Next.js package
   brings `middleware.ts`, server-side `auth()`, and route protection. It also
   puts middleware in front of every request, which interacts with ISR and with
   the `vercel.json` rewrites. Keeping `clerk-js` client-only preserves today's
   behaviour exactly and keeps every other route statically served.
2. **If `@clerk/nextjs`:** what is the matcher, and is it provably scoped so it
   never runs for `/blocks*` (ISR), `/r/*` (static registry JSON), the agent
   endpoints, or the pro rewrites?
3. **Why it was lazy.** Recover the reason `clerk-js` is loaded lazily today
   (bundle size on every page, or something sharper) and decide whether the
   React port must preserve it.
4. **Where do rewrites live?** `vercel.json` today. Next.js can express them in
   `next.config`. Which owns them — and does splitting them across two places
   create a trap? Note `/previews/:path*` has both a bare and a
   trailing-slash rule, and a trailing-slash mismatch has bitten this project
   before.
5. **`/account` rendering.** Fully client-rendered (as today), or does any part
   become a server component? Licenses arrive from a rewritten pro endpoint, so
   a server fetch would need the request's auth context.
6. Does the `/pro` page (374 lines, one client script) share any of this auth
   path, or is it fully public?

## Answer

**1. `@clerk/clerk-js` stays, client-only. No `@clerk/nextjs`, no
`middleware.ts`.** `/account` is the only authenticated surface on the site —
one page out of 101 — and `clerkMiddleware()` would run in front of the whole
deployment to serve it. `09` has just finished keeping the request path clean
for ISR; putting a middleware function in front of `/blocks`, `/r/*.json` and
the agent endpoints to authenticate one page inverts that.

What the Next.js package would genuinely buy, stated so the decline is
informed: `@clerk/nextjs` loads `clerk-js` from Clerk's CDN, and **that** build
ships the UI components, so `<SignIn />` could mount inline instead of
redirecting to Clerk's hosted page. That is a real capability. It is declined
because the hosted redirect is a deliberate decision from the pro-infrastructure
work, it works today, and `/account`'s signed-out state is already designed
around the click-to-redirect (an automatic bounce was rejected there as
hostile).

**2. Moot.** No middleware, so there is no matcher to scope and nothing to prove
about `/blocks*`, `/r/*`, the agent endpoints or the pro rewrites.

**3. The laziness is two mechanisms, not one, and both must survive.** The
ticket asked whether the React port must preserve it. It must, and recovering
*why* shows the reason is sharper than "bundle size":

- **Dynamic `import()`** in `lib/clerk.ts`, so the bundle code-splits out of
  every page that imports the module (the header does, on every page).
- **A `__client_uat` cookie gate** in the header, checked *before* calling
  `getClerk()`. Clerk sets that cookie (`"0"` when signed out) and it is not
  httpOnly, so it is the fastest signed-in hint available without paying for
  Clerk at all. An anonymous visitor has no cookie or a `"0"`, so neither the
  chunk nor any of Clerk's `.load()` network calls enter the request path.

Measured: `dist/clerk.mjs` is **1,525,892 bytes** (1.46 MiB). The cookie gate is
what keeps that off the common case, and the dynamic import alone would not —
it only moves the cost into a second request that the header would still make.
Both come across.

**4. Rewrites stay in `vercel.json`, which remains their single owner.
`next.config` declares none.** Three reasons, in order of weight:

- The trailing-slash pair is a **debugged platform fact**, not a preference:
  `:path*` in a Vercel rewrite does not match a trailing slash, so
  `/previews/x/` 404'd while `/previews/x` worked, and the fix was a slashless
  iframe `src` plus an explicit second rule. Re-expressing that in Next's
  `rewrites()`, with its own path matching and its own `trailingSlash`
  interaction, re-opens a solved bug.
- All five targets are **external** (`pro.sevenui.dev`). Nothing needs to
  compose with Next's routing, which is the only thing `next.config` rewrites
  would add.
- Preview deployments inherit `vercel.json`, which the map's cutover plan
  already depends on to verify `/blocks` and the pro iframes against the live
  pro deployment.

Splitting them across two files is the trap the ticket names, and the answer is
simply not to split: one file, five rules, unchanged.

Verification item, because this exact thing bit before: confirm on the first
preview deployment that `/previews/x/` still resolves. Platform rewrites run
ahead of the Next function and `/previews/*` is not a Next route, so nothing
should reach Next's trailing-slash handling — but "should" is what failed last
time.

**5. `/account` stays fully client-rendered on a static shell.** A server
component cannot fetch the licenses: the request carries a Clerk session cookie,
and turning it into the Bearer token `/api/me/licenses` expects needs a
server-side Clerk context — which is `auth()`, which is `@clerk/nextjs`, which
is decision 1. So the page is statically generated as an empty shell and the
client script fills it, exactly as today.

The three independent failure surfaces are preserved: a Clerk boot failure
renders the whole-page retry, a licenses failure stays inside its own box with
its own retry, and identity/sign-out resolve separately from licenses.

**6. `/pro` is fully public; its Clerk use is progressive enhancement only.**
`enhanceBuyLink` pre-fills `customer_email` and `reference_id` on the checkout
link for a signed-in visitor; signed-out visitors keep the plain link. Nothing
on the page is gated.

**Env.** `PUBLIC_CLERK_PUBLISHABLE_KEY` is an Astro convention
(`import.meta.env.PUBLIC_*`) and becomes `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
(`process.env.NEXT_PUBLIC_*`). It is the site's **only** environment variable —
a full `grep` of `import.meta.env` across `lib/`, `components/` and `pages/`
returns this one line plus `BASE_URL`. `.env.example` and the Vercel project
both need the rename at cutover, and a missing value is silent: `new Clerk(undefined)`
fails inside the lazy path, which the header swallows by design.

## Findings

**`/pro` loads 1.46 MiB of Clerk for every anonymous visitor.** `pro.astro`
calls `getClerk()` unconditionally on `astro:page-load` — it has the dynamic
import but **not** the `__client_uat` gate the header uses. So the site's
marketing page, the one a cold visitor lands on from an ad or a link, pays the
full Clerk bundle to decide it has no email to pre-fill with. This is a live
production cost, not a migration question; it is recorded here because the port
will copy the shape unless told otherwise, and the fix is one `hasSessionHint()`
call. Same family as `11`'s 404 `og:image`: a real defect found while measuring
for parity.

The gate belongs in `lib/clerk.ts` rather than at each call site — three callers
exist (header, `/account`, `/pro`) and only one gates. `/account` is the correct
exception: a visitor who navigated there deliberately should load Clerk
regardless of the hint, since the page is nothing without it.

**`account.astro` is 340 lines that build HTML as strings.** Ported to JSX the
`innerHTML` assignments, the manual escaping of interpolated user data
(`clerk.user.fullName` goes straight into a template literal today) and the
`querySelector`-then-`addEventListener` rebinding all disappear. Same shape as
`08`'s finding about the search excerpt sanitizer: work that exists only because
the output path is `innerHTML`.

## Hand-offs

- **To `12`:** the header's auth control is a client component and keeps the
  `__client_uat` gate; it is the one piece of chrome that touches Clerk.
- **To `14`:** `lib/clerk.ts` survives the migration almost unchanged — only the
  env accessor moves from `import.meta.env` to `process.env`. `vercel.json` is
  explicitly *not* a Blume-shaped workaround and does not get retired.
- **To `15`:** `/account` declares no `noindex` today; whether the authenticated
  surface belongs in the sitemap and the agent endpoints is that ticket's call.
- **To `13`:** no intended-diff entry. Every decision here is parity.
