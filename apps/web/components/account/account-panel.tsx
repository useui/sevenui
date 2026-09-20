"use client";

import type { Clerk } from "@clerk/clerk-js";
import { useEffect, useRef, useState } from "react";
import { getClerkAlways, getClerkIfLikelySignedIn } from "../../lib/clerk";

// Ported from `legacy-pages/account.astro`'s inline `<script>`. Copy is not
// migration territory (spec addendum D) — every string a visitor can read
// below is reproduced verbatim from that file, including this one.
const UNAVAILABLE_MESSAGE = "Sign-in is unavailable right now. Please try again shortly.";

type Identity = { fullName: string; email: string; imageUrl: string };
type LicenseRow = { key: string; displayKey: string };

type LicensesState = { status: "loading" } | { status: "loaded"; licenses: LicenseRow[] } | { status: "error" };

// The four views this component can render, and nothing else — the source's
// 340 lines of markup-string assignment built each of these by hand (plus a
// fifth, the license box's own error state, folded into `LicensesState`
// above since it swaps independently of everything here).
// Each variant below carries exactly the data its view needs, so a render
// branch is never reachable without the data it displays: there is no
// `identity: Identity | null` field to forget to check.
type View =
  | { kind: "signed-out" }
  | { kind: "loading" }
  | { kind: "signed-in"; identity: Identity }
  | { kind: "error" };

/**
 * `<AccountPanel>` — the client half of `/account` (spec §12.3/§12.4, task
 * addendum A/B/C). A server component cannot do this job: showing the
 * license list needs a Bearer token minted from a Clerk *browser* session,
 * which means running `@clerk/clerk-js` in the browser, not `auth()` from
 * `@clerk/nextjs` — the package Task 6.1 declined for this whole migration.
 *
 * THE GATING RULE, reconciled (Controller Ruling 32 — read this before
 * touching the effect below). Two lines of the locked spec look
 * contradictory: §12.2 says "/account is the correct exception: a visitor
 * who navigated there deliberately should load Clerk regardless of the
 * hint," which sounds like this component should call `getClerkAlways()` on
 * mount; §12.4 says an anonymous visit must issue *zero* Clerk requests,
 * which only `getClerkIfLikelySignedIn()` can guarantee. Both are correct,
 * about two different moments:
 *
 *   1. On mount, this component gates exactly like every other caller
 *      (`components/site-header.tsx`'s effect is the same shape on
 *      purpose). No `__client_uat` hint means the signed-out hero already
 *      IS the correct terminal state — Clerk is never fetched.
 *   2. `getClerkAlways()` has exactly one kind of caller here: a deliberate
 *      *click* — "Sign in" on the hero, or "Try again" on the whole-page
 *      error view. At the instant either is clicked the visitor is signed
 *      out by definition (that's why the hero/error view is showing), so
 *      the hint is absent by construction and the gated function would
 *      hand back `undefined`, making the button do nothing. §12.2's
 *      "navigated there deliberately" is sharpened here to "acted": the
 *      1.46 MiB Clerk bundle is paid for the moment it buys something —
 *      a real sign-in or a real retry — never merely for landing on the
 *      page.
 *
 * Both exports of `lib/clerk.ts` are used below and neither is dead code.
 *
 * THE COOKIE CHECK ITSELF is not reimplemented here (task addendum B): it
 * is `lib/clerk.ts`'s `hasSessionHint`, private to that module since Task
 * 6.1 — this component only ever calls the two functions it exports. The
 * default view (`useState<View>({ kind: "signed-out" })` below) is what
 * Next prerenders into `/account`'s prebuilt HTML, so an anonymous visitor's
 * first paint is already the finished, correct page — no request-time
 * `cookies()`/`headers()` read, no dynamic route.
 *
 * THREE INDEPENDENT FAILURE SURFACES (spec §12.3), and why the state shape
 * above keeps them independent instead of one shared error flag:
 *
 *   - a Clerk **boot** failure (the mount effect's `catch`, or a failed
 *     `getClerkAlways()` from a click) renders the whole-page retry —
 *     `view.kind === "error"`;
 *   - a **licenses** failure stays inside its own box —
 *     `licenses.status === "error"` — and never touches `view`, so it
 *     cannot take down identity or sign-out;
 *   - **identity and sign-out** are read straight off `clerk.user` the
 *     moment Clerk resolves and never wait on the licenses fetch: a Polar
 *     hiccup (the licenses endpoint is backed by Polar, and does not exist
 *     at all in local dev) must never lock a visitor out of signing out.
 */
export function AccountPanel() {
  const [view, setView] = useState<View>({ kind: "signed-out" });
  const [licenses, setLicenses] = useState<LicensesState>({ status: "loading" });
  const [signingOut, setSigningOut] = useState(false);
  const [retrying, setRetrying] = useState(false);
  // The resolved Clerk instance, once known. A ref, not state: nothing here
  // is rendered from it directly (every view renders from `view`/`licenses`
  // instead), it just needs to survive between the effect that resolves it
  // and the click handlers (sign out, license retry) that need it later.
  const clerkRef = useRef<Clerk | null>(null);

  // One mount flag for every async callback in this component, not a
  // separate `cancelled` local per effect (Controller Ruling 36): the mount
  // effect below is not the only place that calls `setState` after an
  // `await` — `applyClerk`'s `loadLicenses` call, `handleSignIn`'s catch and
  // `handleRetry` all do too, and none of those run inside the mount
  // effect's own closure, so a local `cancelled` variable there could not
  // guard them. A single ref every one of them checks is simpler than
  // threading a cancellation token through four separate call sites, and
  // reads the same way at each: "if we unmounted while this was in flight,
  // do nothing."
  //
  // The setup body re-arms the ref to `true` (Controller Ruling — round
  // 2/5): App Router runs under `<StrictMode>` in development, which
  // mounts every effect, runs its cleanup, then mounts it again to surface
  // effects that are not idempotent. A ref survives that simulated
  // unmount, so a setup that only ever read `useRef(true)`'s initial value
  // and left the CLEANUP as the only writer would flip `mountedRef.current`
  // to `false` on the first (thrown-away) mount and never set it back —
  // every guard in this file would then read as "unmounted" for the rest
  // of the component's real lifetime, even though it is fully mounted.
  // Setting it back to `true` here makes the effect idempotent the way
  // StrictMode expects: mount -> true, cleanup -> false, remount -> true
  // again, matching whichever pass is actually live.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Turns a resolved Clerk instance into render state, shared by the two
  // places that ever obtain one: the mount effect below (gated) and
  // `handleRetry` (unconditional, via `getClerkAlways`). A hint-gated boot
  // that resolves to a Clerk instance with no `user` means the hint was
  // stale — signed out after all — so it lands on the same "signed-out"
  // view as never having had a hint at all, exactly like
  // `site-header.tsx`'s "signed out after all — leave 'Sign in'" branch.
  function applyClerk(clerk: Clerk) {
    clerkRef.current = clerk;
    const user = clerk.user;
    if (!user) {
      setView({ kind: "signed-out" });
      return;
    }
    setView({
      kind: "signed-in",
      identity: {
        fullName: user.fullName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        imageUrl: user.imageUrl,
      },
    });
    // Identity and sign-out above never depend on this call resolving.
    setLicenses({ status: "loading" });
    void loadLicenses(clerk);
  }

  // The license section resolves independently of identity/sign-out — its
  // failures, and its own retry, stay inside `licenses`.
  async function loadLicenses(clerk: Clerk) {
    try {
      const token = await clerk.session?.getToken();
      const res = await fetch("/api/me/licenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`licenses request failed: ${res.status}`);
      const body = await res.json();
      if (!Array.isArray(body.licenses)) throw new Error("unexpected licenses shape");
      if (!mountedRef.current) return;
      setLicenses({ status: "loaded", licenses: body.licenses });
    } catch (e) {
      console.error("account:", e);
      if (!mountedRef.current) return;
      setLicenses({ status: "error" });
    }
  }

  // §12.4 / task addendum B: gate exactly like every other caller. An empty
  // dependency array is correct — this is a one-time mount check, not
  // something any navigation here re-triggers (this page never
  // soft-navigates into itself).
  //
  // `getClerkIfLikelySignedIn` is NOT `async` (Controller Ruling 34,
  // `lib/clerk.ts`'s own doc comment has the full reasoning): it returns
  // `undefined` synchronously, before awaiting anything, when the hint is
  // absent. That is what makes the branch below exact rather than
  // timing-dependent — `pending` is checked and, when falsy, this effect
  // returns without a single call to `setView`. The `view` this component
  // mounted with — the hero — is never touched, so it never unmounts and
  // remounts, and `.draw`'s animation never restarts. This is a stronger
  // guarantee than "resolves before the browser can act on it": no state
  // update reaches the hero at all on this path.
  useEffect(() => {
    const pending = getClerkIfLikelySignedIn();
    if (!pending) return; // no hint: the hero is never touched at all
    setView({ kind: "loading" }); // reached only when a boot is genuinely in flight
    (async () => {
      try {
        const clerk = await pending;
        if (!mountedRef.current) return;
        applyClerk(clerk);
      } catch (e) {
        console.error("account:", e);
        if (!mountedRef.current) return;
        setView({ kind: "error" });
      }
    })();
  }, []);

  // The hero's "Sign in" button — a deliberate click, so it goes through
  // `getClerkAlways()` per Ruling 32 above, not the gated export. Failure
  // here already swaps the whole view (hero -> whole-page error), unlike
  // `handleRetry` below, so it needs no separate busy state: success
  // navigates the browser away via `redirectToSignIn`, and failure lands on
  // a plainly different screen — there is no outcome that reads as nothing
  // happened.
  async function handleSignIn() {
    try {
      const clerk = await getClerkAlways();
      clerkRef.current = clerk;
      // Inline mounting (`clerk.mountSignIn`) needs Clerk's UI bundle, which
      // the self-hosted npm build does not ship — it is fetched at runtime
      // from Clerk's CDN as "remotely hosted code", and this package never
      // wires that up on its own. `redirectToSignIn` sends the visitor to
      // Clerk's hosted sign-in page instead and brings them back here via
      // `signInForceRedirectUrl`.
      await clerk.redirectToSignIn({ signInForceRedirectUrl: `${window.location.origin}/account` });
    } catch (e) {
      console.error("account:", e);
      if (!mountedRef.current) return;
      setView({ kind: "error" });
    }
  }

  // The whole-page error view's "Try again" button. Also a deliberate
  // click, so it also goes through `getClerkAlways()` (Ruling 32) — a full
  // re-attempt, the same shape as the mount effect's success path, not a
  // page reload.
  //
  // Unlike "Sign in", a failed retry lands back on the SAME view it started
  // on — nothing about the page changes, so with no feedback of its own the
  // click would look like it did nothing (Controller Ruling 35: "a retry
  // that fails instantly and silently is worse than one that says so").
  // `retrying` is that feedback, in the shape `account.astro:222-227`'s
  // sign-out button already uses for the same problem: disable the button
  // and relabel it while the attempt is in flight.
  async function handleRetry() {
    setRetrying(true);
    try {
      const clerk = await getClerkAlways();
      if (!mountedRef.current) return;
      applyClerk(clerk);
    } catch (e) {
      console.error("account:", e);
      if (!mountedRef.current) return;
      setView({ kind: "error" });
    } finally {
      if (mountedRef.current) setRetrying(false);
    }
  }

  async function handleSignOut() {
    const clerk = clerkRef.current;
    if (!clerk) return;
    setSigningOut(true);
    try {
      await clerk.signOut();
    } catch (e) {
      console.error("account:", e);
    }
    // A full navigation, not a Next `router.push` soft navigation: the
    // header is a persistent client component (`app/layout.tsx` never
    // remounts it across routes) that syncs its auth pill once on mount, so
    // a soft navigation here would leave a stale signed-in pill sitting
    // above a freshly signed-out page. The source's reason ("so the
    // header's cookie check ... re-runs fresh") was written for Astro's
    // `<ClientRouter>`, which is gone, but the underlying problem —
    // a persistent header script that only ever syncs once — is the same
    // one, just under a different navigation mechanism. No `mountedRef`
    // check needed after this: the navigation itself unmounts everything.
    window.location.assign("/account");
  }

  return (
    <div className="l-row" id="account-root">
      {view.kind === "signed-out" && <SignedOutHero onSignIn={handleSignIn} />}
      {view.kind === "loading" && <LoadingSkeleton />}
      {view.kind === "error" && <WholePageError onRetry={handleRetry} retrying={retrying} />}
      {view.kind === "signed-in" && (
        <SignedIn
          identity={view.identity}
          licenses={licenses}
          onRetryLicenses={() => {
            const clerk = clerkRef.current;
            if (!clerk) return;
            setLicenses({ status: "loading" });
            void loadLicenses(clerk);
          }}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
      )}
    </div>
  );
}

// The whole-page skeleton (view 2): the same three-line placeholder the
// source page always rendered up front, before its script ran. Here it is
// reachable only on the hint-present path — see the mount effect above.
function LoadingSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3 px-6 py-14 sm:px-10">
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

// The signed-out hero (view 1) — the default, server-rendered view. The
// `.draw`/`.ink` sketch and its keyframes are the page's one authored motion
// moment, ported into `app/globals.css` under `#account-root` (task
// addendum E).
function SignedOutHero({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Your license key
          <br />
          lives here.
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Sign in with the email you purchased with to view and copy your key — it unlocks every Pro block as
          the catalog ships.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={onSignIn}
            type="button"
          >
            Sign in
          </button>
          <span className="text-sm text-muted-foreground">
            No license yet?{" "}
            <a className="text-foreground underline underline-offset-4 hover:no-underline" href="/pro">
              Pre-order — $99
            </a>
          </span>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex items-center justify-center border-t border-border bg-muted/40 px-10 py-14 lg:border-t-0 lg:border-l lg:py-20"
      >
        <svg className="h-auto w-full max-w-[340px] text-muted-foreground" viewBox="0 0 300 170">
          <rect
            className="draw opacity-40"
            fill="none"
            height="138"
            pathLength="1"
            rx="10"
            stroke="currentColor"
            strokeWidth="2"
            width="268"
            x="16"
            y="16"
          />
          <circle className="draw opacity-40" cx="52" cy="52" fill="none" pathLength="1" r="14" stroke="currentColor" strokeWidth="2" />
          <rect className="ink opacity-50" fill="currentColor" height="9" rx="4.5" width="104" x="78" y="40" />
          <rect className="ink opacity-30" fill="currentColor" height="7" rx="3.5" width="76" x="78" y="57" />
          <line className="draw opacity-30" pathLength="1" stroke="currentColor" strokeWidth="2" x1="16" x2="284" y1="86" y2="86" />
          <rect className="ink opacity-30" fill="currentColor" height="12" rx="6" width="168" x="34" y="102" />
          <rect
            className="draw opacity-40"
            fill="none"
            height="16"
            pathLength="1"
            rx="8"
            stroke="currentColor"
            strokeWidth="2"
            width="64"
            x="34"
            y="126"
          />
          <rect className="ink opacity-50" fill="currentColor" height="9" rx="4.5" width="52" x="214" y="102" />
        </svg>
      </div>
    </div>
  );
}

// The whole-page retry (view 4): a Clerk boot failure, from either the mount
// effect or a failed `getClerkAlways()` call. This is the one non-default
// view fully verifiable pre-production (Ruling 27): setting
// `__client_uat=1` by hand forces the mount effect's gated call to actually
// boot, and Clerk's production instance answers any non-`sevenui.dev`
// origin with `400 origin_invalid`, landing here through the ordinary code
// path above — no separate test-only branch exists to reach it.
function WholePageError({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
  return (
    <div className="px-6 py-14 sm:px-10">
      <p className="text-sm text-muted-foreground">{UNAVAILABLE_MESSAGE}</p>
      <button
        className="mt-4 inline-flex h-8 items-center rounded-md border border-border px-3 text-sm hover:bg-muted disabled:opacity-60"
        disabled={retrying}
        onClick={onRetry}
        type="button"
      >
        {retrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

// View 3 and its identity/sign-out header. Split into its own component so
// the licenses box's independent states (below) stay visually and
// structurally separate from identity — the same independence the state
// shape enforces.
function SignedIn({
  identity,
  licenses,
  onRetryLicenses,
  onSignOut,
  signingOut,
}: {
  identity: Identity;
  licenses: LicensesState;
  onRetryLicenses: () => void;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const displayName = identity.fullName || identity.email || "Signed in";

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 sm:px-10">
        <div className="flex min-w-0 items-center gap-3">
          {/* Plain <img>, not next/image: the avatar is a remote,
              user-controlled URL Clerk hosts, and the source never ran it
              through an optimizer either — the same choice
              `components/blocks/category-card.tsx` makes for its covers. */}
          <img alt={displayName} className="size-10 shrink-0 rounded-full" src={identity.imageUrl} />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{identity.email}</p>
          </div>
        </div>
        <button
          className="h-8 shrink-0 rounded-md border border-border px-3 text-sm hover:bg-muted disabled:opacity-60"
          disabled={signingOut}
          onClick={onSignOut}
          type="button"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
      <div
        aria-live="polite"
        className={licenses.status === "loading" ? "space-y-3 px-6 py-10 sm:px-10" : "px-6 py-10 sm:px-10"}
      >
        <LicensesBox identity={identity} licenses={licenses} onRetry={onRetryLicenses} />
      </div>
    </>
  );
}

function LicensesBox({
  identity,
  licenses,
  onRetry,
}: {
  identity: Identity;
  licenses: LicensesState;
  onRetry: () => void;
}) {
  if (licenses.status === "loading") {
    return (
      <>
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
      </>
    );
  }

  if (licenses.status === "error") {
    // Failure wears the empty state's clothes (the common real-world case
    // is simply "no license"), with one honest line so a paying customer
    // isn't told they own nothing: we couldn't check, here's the retry.
    return (
      <div className="max-w-md">
        <h2 className="text-xl font-semibold tracking-tight">No license here yet.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pre-order now and your key appears here the moment checkout completes.
        </p>
        <a
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          href="/pro"
        >
          Pre-order SevenUI Pro — $99
        </a>
        <p className="mt-4 text-xs text-muted-foreground">
          Bought with a different email? Your key is also in the Polar customer portal receipt email.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Already purchased with this one? We couldn't check your licenses just now —{" "}
          <button className="underline underline-offset-4 hover:no-underline" onClick={onRetry} type="button">
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  if (licenses.licenses.length === 0) {
    return (
      <div className="max-w-md">
        <h2 className="text-xl font-semibold tracking-tight">No license yet.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pre-order now and your key appears here the moment checkout completes.
        </p>
        <a
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          href="/pro"
        >
          Pre-order SevenUI Pro — $99
        </a>
        <p className="mt-4 text-xs text-muted-foreground">
          Bought with a different email? Your key is also in the Polar customer portal receipt email.
        </p>
      </div>
    );
  }

  const licensedTo = identity.fullName || identity.email || "this account";

  return (
    <>
      {licenses.licenses.map((license) => (
        <LicenseCard key={license.key} license={license} licensedTo={licensedTo} />
      ))}
    </>
  );
}

// The license card carries the site's crop-mark signature (task addendum
// E) — `.license-card::before`/`::after`, scoped under `#account-root` in
// `app/globals.css` so it cannot bleed into `/pro`'s catalog sketches.
function LicenseCard({ license, licensedTo }: { license: LicenseRow; licensedTo: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="license-card relative max-w-2xl border border-border bg-background">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-3">
        <h2 className="font-semibold tracking-tight">SevenUI Pro</h2>
        <span className="font-mono text-xs text-muted-foreground">lifetime · per-developer</span>
      </div>
      <div className="bg-muted/40 px-6 py-7">
        <p className="font-mono text-xs text-muted-foreground">License key</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 truncate font-mono text-base tracking-wide text-foreground sm:text-lg">
            {license.displayKey}
          </code>
          <button
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-muted"
            onClick={() => {
              navigator.clipboard.writeText(license.key);
              setCopied(true);
            }}
            type="button"
          >
            <svg aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16">
              <rect height="8" rx="1.5" width="8" x="5.5" y="5.5" />
              <path d="M10.5 5.5v-2a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3.5v5A1.5 1.5 0 0 0 4 10h1.5" strokeLinecap="round" />
            </svg>
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Keep it out of committed files — it identifies your purchase.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3 text-xs text-muted-foreground">
        <span>
          Licensed to <span className="text-foreground">{licensedTo}</span> — unlimited personal and commercial
          projects
        </span>
        <span className="font-mono">sevenui.dev/pro</span>
      </div>
    </div>
  );
}
