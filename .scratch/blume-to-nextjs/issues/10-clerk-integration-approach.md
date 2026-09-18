# Clerk integration approach

Type: grilling
Status: open

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
