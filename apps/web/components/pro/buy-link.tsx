"use client";

import { useEffect, useRef, useState } from "react";
import { getClerkIfLikelySignedIn } from "../../lib/clerk";

/**
 * `/pro`'s one client island (task 6.3 addendum A). Every other pixel on the
 * page is plain server-rendered markup — nothing on `/pro` is gated (§12.5)
 * — and Clerk touches exactly one thing: it may rewrite this anchor's `href`
 * for a signed-in visitor. That is the whole reason this is a small island
 * around one link rather than the whole page becoming a client component
 * for one `useEffect`.
 *
 * `checkoutUrl` is a prop, not a constant in this file (task addendum C):
 * `app/pro/page.tsx` owns the ONLY place the checkout URL lives, and this
 * component's job is to enhance a URL it was handed, never to know which
 * URL that is.
 *
 * THE GATE (task addendum B): `getClerkIfLikelySignedIn` — not
 * `getClerkAlways` — because there is no deliberate click here that needs an
 * identity, unlike `/account`'s "Sign in" / "Try again" buttons
 * (`components/account/account-panel.tsx`). `/pro` is, per §12.4, "the
 * marketing page a cold visitor lands on from an ad", and today the whole
 * 1.46 MiB Clerk bundle is paid "purely to decide there is no email to
 * pre-fill." `getClerkIfLikelySignedIn` returns `undefined` SYNCHRONOUSLY,
 * before awaiting anything, when the `__client_uat` cookie hint is absent
 * (`lib/clerk.ts`, Controller Ruling 34) — so for the overwhelming common
 * case, an anonymous visitor, the dynamic `import()` of `@clerk/clerk-js`
 * and every network call it would make are never reached at all. That is
 * this component's entire commercial point.
 *
 * Ported from `legacy-pages/pro.astro`'s inline `enhanceBuyLink` script.
 * That script re-ran on the `astro:page-load` event because Astro's
 * `<ClientRouter>` replaced the DOM on every client-side navigation; App
 * Router has no equivalent event and needs none — this component mounts
 * fresh per page visit instead of surviving across navigations, so a single
 * mount effect already covers this component's whole lifetime. A reader who
 * knows the old script will look for the missing listener; this comment is
 * that answer.
 */
export function BuyLink({ checkoutUrl }: { checkoutUrl: string }) {
  // The plain URL is the initial (and prerendered) value, so an anonymous
  // visitor's prerendered HTML — and a visitor whose enhancement never
  // resolves — always carries a working, unmodified checkout link.
  const [href, setHref] = useState(checkoutUrl);

  // One mount flag, re-armed on setup rather than only ever written by
  // cleanup (the same shape `components/account/account-panel.tsx` uses,
  // for the same reason): App Router runs under `<StrictMode>` in
  // development, which mounts an effect, runs its cleanup, then mounts it
  // again. A ref whose setup never resets it back to `true` would read
  // "unmounted" for the rest of this component's real lifetime after that
  // simulated remount, and the guard below would silently stop enhancing
  // the link on every dev render.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const pending = getClerkIfLikelySignedIn();
    if (!pending) return; // no hint: nothing to enhance, the plain link stays

    (async () => {
      try {
        const clerk = await pending;
        const email = clerk.user?.primaryEmailAddress?.emailAddress;
        if (!email || !mountedRef.current) return;
        const url = new URL(checkoutUrl);
        url.searchParams.set("customer_email", email);
        url.searchParams.set("reference_id", clerk.user!.id);
        setHref(url.toString());
      } catch (e) {
        // Wrapped per task addendum B: on every preview deployment this
        // catch fires for real. Clerk's production instance answers `400
        // origin_invalid` to any origin that is not sevenui.dev or a
        // subdomain, so a hint cookie present on a *.vercel.app preview
        // always fails to boot here. The link must survive that untouched —
        // `href` state was never changed away from `checkoutUrl`, which is
        // exactly what a signed-out visitor gets and is always a working
        // link. Never let this path blank, disable or otherwise break the
        // anchor.
        console.error("pro:", e);
      }
    })();
  }, [checkoutUrl]);

  return (
    <a
      className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      href={href}
      id="pro-buy"
    >
      Pre-order — $99
    </a>
  );
}
