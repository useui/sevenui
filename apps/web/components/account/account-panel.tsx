"use client";

import type { Clerk } from "@clerk/clerk-js";
import { useEffect, useRef, useState } from "react";
import { getClerkAlways, getClerkIfLikelySignedIn } from "../../lib/clerk";

const UNAVAILABLE_MESSAGE = "Sign-in is unavailable right now. Please try again shortly.";

type Identity = { fullName: string; email: string; imageUrl: string };
type LicenseRow = { key: string; displayKey: string };

type LicensesState = { status: "loading" } | { status: "loaded"; licenses: LicenseRow[] } | { status: "error" };

type View =
  | { kind: "signed-out" }
  | { kind: "loading" }
  | { kind: "signed-in"; identity: Identity }
  | { kind: "error" };

export function AccountPanel() {
  const [view, setView] = useState<View>({ kind: "signed-out" });
  const [licenses, setLicenses] = useState<LicensesState>({ status: "loading" });
  const [signingOut, setSigningOut] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const clerkRef = useRef<Clerk | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

  async function handleSignIn() {
    try {
      const clerk = await getClerkAlways();
      clerkRef.current = clerk;
      await clerk.redirectToSignIn({ signInForceRedirectUrl: `${window.location.origin}/account` });
    } catch (e) {
      console.error("account:", e);
      if (!mountedRef.current) return;
      setView({ kind: "error" });
    }
  }

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

function LoadingSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3 px-6 py-14 sm:px-10">
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
    </div>
  );
}

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
