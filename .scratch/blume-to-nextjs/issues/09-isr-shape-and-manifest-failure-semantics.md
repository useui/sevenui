# ISR shape and manifest failure semantics

Type: grilling
Status: open

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
