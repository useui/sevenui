import type { Clerk } from "@clerk/clerk-js";

// This module reads `document.cookie` and drives `@clerk/clerk-js`'s browser
// SDK, so every export here only works in a browser. It deliberately does
// NOT carry a "use client" directive: that directive's real effect is
// turning a *component* export into an opaque client reference so a Server
// Component can render it as JSX, and nothing exported below is a component.
// The three callers (the header, /account, /pro) are themselves "use client"
// components, so this module is already on the client side of the boundary
// by the time any of these functions run. If a Server Component ever called
// one directly anyway, it fails immediately and loudly with `ReferenceError:
// document is not defined` — the same fail-loud-not-silent guarantee
// `lib/page-meta.ts` gets from the `server-only` package, just enforced by
// the browser global itself rather than by a matching `client-only` package.
//
// Two mechanisms keep the ~1.5MB Clerk SDK off the common request, and they
// are not one mechanism:
//
//   1. The dynamic `import()` in `loadClerk` below code-splits
//      `@clerk/clerk-js` — measured 1,525,892 bytes (1.46 MiB) as
//      `dist/clerk.mjs` — out of the chunk of every page that imports this
//      module (the header, on every page).
//   2. `getClerkIfLikelySignedIn`'s cookie pre-check is what keeps that
//      chunk from ever being *requested* by a signed-out visitor. The
//      dynamic import alone would not do this — it only moves the cost into
//      a second request the header would still make on every page load; the
//      cookie check is what removes the request entirely for the common
//      case.
//
// Both exported functions resolve through one lazy singleton (`clerkPromise`
// inside `loadClerk`), so a page that calls the gated function and then the
// ungated one does not boot Clerk twice.

let clerkPromise: Promise<Clerk> | null = null;

function loadClerk(): Promise<Clerk> {
  clerkPromise ??= (async () => {
    const { Clerk } = await import("@clerk/clerk-js");
    const clerk = new Clerk(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!);
    await clerk.load();
    return clerk;
  })();
  return clerkPromise;
}

// Ported verbatim from legacy-components/blume/Header.astro:304-311, which
// is the authority on its exact shape — do not change what it accepts or
// rejects here. Clerk sets `__client_uat` (last-active-at, "0" when signed
// out) on every request it has seen; it is readable from plain
// `document.cookie` since it is not httpOnly, which makes it the fastest
// signed-in hint available without paying for Clerk at all. Kept private:
// the whole point of gating inside this module is that no call site
// re-implements this check. The original returns `boolean` only by
// coercion (`value` is a possibly-empty string, not a boolean) — the `!!`
// below makes that explicit without changing what it accepts or rejects.
function hasSessionHint(): boolean {
  return document.cookie.split("; ").some((entry) => {
    const [name, value] = entry.split("=");
    return name === "__client_uat" && !!value && value !== "0";
  });
}

/**
 * Loads Clerk only when the `__client_uat` cookie hints a signed-in visitor.
 * Returns `undefined` *before* awaiting anything when the hint is absent, so
 * the dynamic `import()` — and every network call `.load()` makes — is
 * never reached for the common case: an anonymous visitor browsing
 * docs/blocks pages. This is what the header calls, since it renders on
 * every page and must not pay for Clerk on each one.
 */
export async function getClerkIfLikelySignedIn(): Promise<Clerk | undefined> {
  if (!hasSessionHint()) return undefined;
  return loadClerk();
}

/**
 * Loads Clerk unconditionally, ignoring the cookie hint. `/account`'s page
 * load still gates through `getClerkIfLikelySignedIn` like every other
 * caller — no hint means the signed-out hero is the terminal state and Clerk
 * is never fetched, so an anonymous visit issues zero Clerk requests. This
 * function exists for the one moment that gate can't cover: a deliberate
 * *click* on `/account` — the signed-out hero's "Sign in" button, or the
 * boot-failure view's retry — that must call `clerk.redirectToSignIn(...)`
 * right then. At that instant the visitor is signed out by definition, so
 * `__client_uat` is absent and the gated function would return `undefined`,
 * making the button do nothing; the cookie hint isn't wrong here, it's
 * structurally incapable of saying anything else at a sign-in click. The
 * 1.46 MiB is paid the moment it buys something, not before.
 */
export async function getClerkAlways(): Promise<Clerk> {
  return loadClerk();
}
