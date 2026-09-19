# ISR shape and manifest failure semantics

Type: grilling
Status: resolved
Assignee: Oğuzhan (this session)

## Question

ISR is the reason this migration exists, and its target is settled: the pro
manifest only, `revalidate: 300`, serve stale on a failed fetch. The
implementation shape is not.

Today `apps/web/lib/pro-manifest.ts` fetches
`https://pro.sevenui.dev/r/pro-manifest.json` at build time, validates it
thoroughly, and **throws on any shape violation** — deliberately, so a bad
manifest fails the build instead of publishing an empty `/blocks`. Under ISR
that same throw has a different meaning, and the three consuming routes
(`/blocks`, `/blocks/[group]`, `/blocks/[group]/[category]`) each generate their
params from it.

Settle:

1. **Which caching primitive?** `fetch` with `next: { revalidate: 300 }`,
   a route-segment `export const revalidate = 300`, or `unstable_cache` /
   `"use cache"` around `loadProManifest`. They differ in whether the cache is
   shared across the three routes and across `generateStaticParams`.
2. **First build vs revalidation.** A throw during revalidation keeps the last
   good page; a throw during the *initial* build still fails the build, and
   `generateStaticParams` needs the manifest to enumerate groups and categories
   at all. Is a build-time failure still the wanted behaviour on a cold build,
   with stale-serve applying only to revalidations?
3. **What counts as a failure?** A non-200 fetch, and separately a 200 whose
   shape `parseManifest` rejects. Does a shape violation also serve stale, or
   should it be louder (it means the pro repo published something incompatible)?
4. **New groups and categories.** `generateStaticParams` enumerates routes from
   the manifest. When pro adds a category, does its route appear without a
   rebuild? That requires `dynamicParams` to allow it and the new path to render
   on demand — confirm this is wanted, since it is the actual user-visible
   promise of "no manual rebuild".
5. **On-demand revalidation.** Settled as not required, but is a
   `revalidateTag` webhook worth designing into the spec now (the pro repo
   already has `trigger-web-rebuild.yml` to repurpose), or explicitly deferred?
6. **Local dev and CI.** `PRO_MANIFEST_URL` can point at a local fixture
   (`lib/pro-manifest.fixture.json`) — does that stay, and does CI build
   against the fixture or the live manifest? CI currently runs `pnpm build`,
   which today hits the live URL.
7. **Observability.** With stale-serve, a broken manifest becomes silent. How is
   it noticed?

## Answer

**0. Measured.** The live manifest is 3 groups, 14 categories, 65 items, 27.8 KB
— so ISR covers **18 routes** (`/blocks`, 3 group pages, 14 category pages).
`13-parity-proof-method` counted 16 live `/blocks` routes; the taxonomy has
grown by two since, which is a live demonstration of its own rule that the
inventory is generated and never frozen.

Today `pages/blocks/_data.ts` calls `await loadProManifest()` at module scope,
so there is **one fetch per build** shared by all three routes. The target shape
must preserve that property.

**1. `fetch` with `next: { revalidate: 300, tags: ['pro-manifest'] }`, plus
`export const revalidate = 300` on each of the three segments.** The Data Cache
is keyed by URL, so one entry serves all three routes *and*
`generateStaticParams` — the same single-fetch property the module singleton has
today. The segment export is redundant with the fetch option and kept anyway:
a reader of `page.tsx` should not have to open the loader to learn the route is
ISR.

`"use cache"` / `cacheLife` is **not** used. In Next 16 it sits behind the
`cacheComponents` flag, which changes rendering semantics application-wide —
too large a blast radius to adopt for one data source. If the chrome port (`12`)
ends up enabling that flag for its own reasons, this is worth revisiting.

The fetch goes **directly** to `https://pro.sevenui.dev/r/pro-manifest.json`,
not through the site's own `/r/pro-manifest.json` rewrite: a server-side fetch
to its own origin is a self-request through Vercel's edge, and on a cold build
the site is not serving yet.

**2. Build-time failure stays hard; stale-serve applies to revalidation only —
and it comes for free.** The current throw-everything behaviour already produces
exactly the wanted semantics under ISR, so **no change to `loadProManifest` is
needed**; only a statement of what the throw now means:

| When | Today | Under ISR |
| --- | --- | --- |
| Build (`generateStaticParams`) | build fails | build fails — unchanged, and wanted: a cold build has no previous good page to fall back to, and publishing an empty `/blocks` is worse than failing |
| Background revalidation | n/a | last good page keeps serving, Next retries on the next request past the window |
| On-demand render of a *new* path | n/a | no previous version exists, so this one errors rather than serving stale |

**3. A shape violation is treated exactly like a non-200 — both serve stale.**
The ticket asked whether a shape violation should be louder, since it means the
pro repo published something incompatible. It cannot be made louder *at the
route level*: during revalidation Next keeps the last good page regardless of
why the render threw. "Louder" therefore means an alert, not different page
behaviour — which is decision 7's job. And stale is not wrong here: the previous
manifest was valid, so the page it produced is correct, just behind.

**4. New groups and categories appear without a rebuild — and the mechanism is
worth writing down, because it is not the obvious one.**
`generateStaticParams` runs **at build time only**; it does not re-run on
revalidation. So a new category does not enter the enumerated set. It becomes
reachable like this:

1. `/blocks` and `/blocks/[group]` revalidate on their 300s window and re-render
   from the fresh manifest, so their listings now include the new category.
2. That listing links to `/blocks/<group>/<new>`, which is not in the enumerated
   set — `dynamicParams` (Next's default, declared explicitly) renders it on
   demand and caches the result.

`dynamicParams` is not optional here: with it off, a new category would 404
until someone rebuilt, which is the exact manual step this migration exists to
remove.

Its required consequence: **the pages must call `notFound()`**. Today they use
`groups.find(...)!` — a non-null assertion that was safe only because every
rendered path came from `generateStaticParams`. Under `dynamicParams` an
arbitrary path reaches the component, and the assertion would produce a 500
instead of a 404. The same `notFound()` also handles *removal*: if pro deletes a
group, its already-cached route stays in the route cache until it revalidates,
at which point the lookup misses and it becomes a 404.

**5. On-demand revalidation is deferred, but the tag ships now.** 300 seconds is
the SLA the map already settled, so a webhook adds nothing today. The fetch
carries `tags: ['pro-manifest']` anyway — one property — so a
`revalidateTag('pro-manifest')` route handler with a shared secret is later a
single-file addition rather than a refactor. The pro repo's
`trigger-web-rebuild.yml` is the natural caller when that day comes.

**6. CI builds against the fixture; production builds against the live
manifest.** `ci.yml` runs a bare `pnpm build` today, so web CI reaches
`pro.sevenui.dev` on every pull request. ISR removes the value of that coupling:
a bad manifest no longer breaks the site, and Vercel's production build still
fetches live and still fails hard, so deploy protection is unchanged. What
remains is pure cost — a pro outage turning web pull requests red. CI therefore
sets `PRO_MANIFEST_URL=lib/pro-manifest.fixture.json` and becomes hermetic.

**7. The signal CI gives up is not lost; it moves to a scheduled canary.** A
workflow in this repo fetches the live manifest and runs `parseManifest` on it,
failing on any violation. This is strictly better than what CI did: CI only ran
on pull requests, while a bad manifest can land at any time, and stale-serve
means nothing else would ever notice. A runtime health endpoint was considered
and dropped — it requires someone to watch it, whereas a scheduled job reports
through a channel the dev already reads.

## Findings

**Two claims in this answer cannot be verified from this repository and are
written as build-time proof obligations, not assumptions** — the same treatment
`06` gave Turbopack's context modules:

- that `"use cache"` in Next 16.3.5 requires the `cacheComponents` flag, which
  is what makes it too invasive for one data source;
- that `revalidateTag` invalidates the rendered route cache and not merely the
  tagged fetch entry, which is what makes decision 5's deferral cheap.

If the second turns out false, the deferred webhook is more expensive than
stated and decision 5 should be reopened before the spec locks.

**`13`'s route count is already out of date.** It recorded 16 live `/blocks`
routes; the manifest now yields 18. Nothing is wrong — this is the rule working
— but it is worth carrying as evidence that the parity inventory must be
generated at cutover time and never transcribed.

## Hand-offs

- **To `13`:** `/blocks` route count is manifest-derived and moves; generate it
  at cutover, do not reuse the 16 recorded in that ticket. No intended-diff
  entry from this ticket — ISR changes when a page is built, not what it says.
- **To `14`:** `ci.yml`'s bare `pnpm build` gains
  `PRO_MANIFEST_URL=lib/pro-manifest.fixture.json`, and a scheduled
  manifest-canary workflow joins it. The fixture itself
  (`lib/pro-manifest.fixture.json`, 2 groups / 3 categories / 3 items) stays and
  becomes load-bearing rather than incidental.
- **To `12`:** if the chrome port has its own reason to enable `cacheComponents`,
  decision 1 is worth revisiting — `"use cache"` would then be free rather than
  invasive.
