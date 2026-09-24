"use client";

import { ArrowRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button, buttonVariants } from "@/registry/base/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/base/ui/select";
import { Spinner } from "@/registry/base/ui/spinner";
import { Logomark } from "../logomark";
import { SetupSteps } from "../pro/setup-steps";
import { KeyLedger, keyName } from "./key-ledger";
import { KeySkeleton, KeySurface, LockedKey, SURFACE } from "./key-surface";
import type { AccountViewProps, Identity, LicenseRow, LicensesState } from "./types";

const BUY_HREF = "/pro#order";
const SUPPORT_EMAIL = "mail@sevenui.dev";
const RECEIPT_NOTE = "Bought with a different email? Your key is also in the Polar receipt email.";
const TITLE = "text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-[3.5rem]";
const LEAD = "mt-5 max-w-[34rem] text-lg leading-relaxed text-pretty text-muted-foreground";
const COLUMNS = "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16";
const LINK = "font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground";
const PULSE = "animate-pulse rounded-sm bg-muted motion-reduce:animate-none";

/** Pure presentation of /account. Every state is a prop; the container owns Clerk. */
export function AccountView(props: AccountViewProps) {
  const { view } = props;
  return (
    <>
      {view.kind === "signed-out" && <SignedOut onSignIn={props.onSignIn} />}
      {view.kind === "loading" && <SessionLoading />}
      {view.kind === "error" && <Unavailable onRetry={props.onRetry} retrying={props.retrying} />}
      {view.kind === "signed-in" && (
        <SignedIn
          identity={view.identity}
          licenses={props.licenses}
          onRetryLicenses={props.onRetryLicenses}
          onSignOut={props.onSignOut}
          signingOut={props.signingOut}
        />
      )}
    </>
  );
}

/** Text on the left, the key object on the right: the shape every keyless state shares. */
function Split({ children, aside }: { children: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="l-row grid grid-cols-1 items-center gap-12 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
      <div>{children}</div>
      <div className="lg:pl-4">{aside}</div>
    </div>
  );
}

function SignedOut({ onSignIn }: { onSignIn: () => void }) {
  const [opening, setOpening] = React.useState(false);
  return (
    <Split aside={<LockedKey caption="Sign in to see and copy your key." />}>
      <h1 className={TITLE}>Your license key lives here.</h1>
      <p className={LEAD}>
        Your SevenUI Pro key belongs to the email you paid with. Sign in with that address — Google, GitHub, or a
        one-time code by email — and it&apos;s here, ready to copy into your project.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button
          aria-disabled={opening || undefined}
          className="h-10 min-w-28 px-5"
          onClick={() => {
            if (opening) return;
            setOpening(true);
            onSignIn();
          }}
          size="lg"
          type="button"
        >
          {opening ? <Spinner aria-hidden data-icon="inline-start" role="presentation" /> : null}
          {opening ? "Opening sign-in…" : "Sign in"}
        </Button>
        <p className="text-sm text-muted-foreground">
          No license yet?{" "}
          <Link className={LINK} href={BUY_HREF}>
            Pro is $99 at launch
          </Link>
        </p>
      </div>
      <p aria-live="polite" className="sr-only" role="status">
        {opening ? "Opening sign-in…" : ""}
      </p>
    </Split>
  );
}

/** The identity strip, full width under the header; the skeleton has the same box. */
function IdentityBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border">
      <div className="l-row flex min-h-[4.5rem] items-center justify-between gap-4 px-6 py-4 sm:px-8">{children}</div>
    </div>
  );
}

function IdentitySkeleton() {
  return (
    <IdentityBar>
      <div aria-hidden className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="flex flex-col gap-2">
          <div className={`h-3.5 w-32 ${PULSE}`} />
          <div className={`h-3 w-44 ${PULSE}`} />
        </div>
      </div>
      <div aria-hidden className={`h-8 w-20 rounded-lg ${PULSE}`} />
    </IdentityBar>
  );
}

function SessionLoading() {
  return (
    <div aria-busy="true">
      <h1 className="sr-only">Account</h1>
      <p aria-live="polite" className="sr-only" role="status">
        Checking your sign-in…
      </p>
      <IdentitySkeleton />
      <div aria-hidden className={`l-row grid grid-cols-1 items-start gap-10 px-6 py-14 sm:px-8 sm:py-20 ${COLUMNS}`}>
        <div className="lg:pt-2">
          <div className={`h-12 w-72 max-w-full rounded-md ${PULSE}`} />
          <div className={`mt-6 h-4 w-80 max-w-full ${PULSE}`} />
          <div className={`mt-3 h-4 w-64 max-w-full ${PULSE}`} />
        </div>
        <KeySkeleton />
      </div>
    </div>
  );
}

function Unavailable({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
  return (
    <Split aside={<LockedKey caption="Your key is safe. It shows here once sign-in is back." />}>
      <h1 className={TITLE}>Sign-in is unavailable right now.</h1>
      <p className={LEAD}>We couldn&apos;t reach the sign-in service. Your license is not affected; try again in a moment.</p>
      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
        {/* aria-disabled, not disabled: focus stays on the button while it retries. */}
        <Button
          aria-disabled={retrying || undefined}
          className="h-10 min-w-32 px-5"
          onClick={() => {
            if (!retrying) onRetry();
          }}
          size="lg"
          type="button"
        >
          {retrying ? <Spinner aria-hidden data-icon="inline-start" role="presentation" /> : null}
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      </div>
      <p className="mt-6 max-w-[34rem] text-sm leading-relaxed text-muted-foreground">
        Need the key right now? It&apos;s in the receipt email from Polar. Still failing after a few minutes? Write to{" "}
        <a className={LINK} href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <p aria-live="polite" className="sr-only" role="status">
        {retrying ? "Retrying sign-in…" : ""}
      </p>
    </Split>
  );
}

function initialsOf(identity: Identity) {
  const source = identity.fullName || identity.email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (identity.fullName ? (parts[1]?.[0] ?? "") : "")).toUpperCase() || "?";
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
  const rows = licenses.status === "loaded" ? licenses.licenses : [];

  let status = "";
  if (licenses.status === "loading") status = "Loading your licenses…";
  else if (licenses.status === "error") status = "We couldn't check your licenses.";
  else status = rows.length === 0 ? "No license on this account yet." : `${rows.length} license key${rows.length === 1 ? "" : "s"} loaded.`;

  return (
    <>
      <IdentityBar>
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="lg">
            {identity.imageUrl ? <AvatarImage alt="" src={identity.imageUrl} /> : null}
            <AvatarFallback>{initialsOf(identity)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {identity.fullName && identity.email ? (
              <p className="truncate text-sm text-muted-foreground">{identity.email}</p>
            ) : null}
          </div>
        </div>
        <Button
          aria-disabled={signingOut || undefined}
          className="shrink-0"
          onClick={() => {
            if (!signingOut) onSignOut();
          }}
          type="button"
          variant="outline"
        >
          {signingOut ? <Spinner aria-hidden data-icon="inline-start" role="presentation" /> : null}
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </IdentityBar>
      <p aria-live="polite" className="sr-only" role="status">
        {signingOut ? "Signing out…" : status}
      </p>

      {licenses.status === "loading" ? (
        <div aria-busy="true" className={`l-row grid grid-cols-1 items-start gap-10 px-6 py-14 sm:px-8 sm:py-20 ${COLUMNS}`}>
          <div className="lg:pt-2">
            <h1 className={TITLE}>Your license key</h1>
            <div aria-hidden className={`mt-7 h-4 w-80 max-w-full ${PULSE}`} />
            <div aria-hidden className={`mt-3 h-4 w-64 max-w-full ${PULSE}`} />
          </div>
          <KeySkeleton />
        </div>
      ) : rows.length > 0 ? (
        <Licensed identity={identity} rows={rows} />
      ) : (
        <NoLicense failed={licenses.status === "error"} onRetry={onRetryLicenses} />
      )}
    </>
  );
}

function Licensed({ identity, rows }: { identity: Identity; rows: LicenseRow[] }) {
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const active = rows.find((row) => row.key === selectedKey) ?? rows[0];
  const activeIndex = rows.indexOf(active);
  const licensedTo = identity.fullName || identity.email || "this account";
  const several = rows.length > 1;
  const keyItems = rows.map((row, index) => ({ value: row.key, label: keyName(index) }));

  return (
    <>
      <div className={`l-row grid grid-cols-1 items-start gap-10 px-6 py-14 sm:px-8 sm:py-20 ${COLUMNS}`}>
        <div className="lg:pt-2">
          <h1 className={TITLE}>{several ? "Your license keys" : "Your license key"}</h1>
          <p className={LEAD}>
            {several
              ? `${rows.length} licenses, one per developer. Every key unlocks every Pro Block, including the ones that ship after today.`
              : "It unlocks every Pro Block, including the ones that ship after today."}
          </p>
          <p className="mt-4 max-w-[34rem] text-sm leading-relaxed text-muted-foreground">
            The page only shows {several ? "keys" : "the key"} masked. Copy puts the full key on your clipboard.
          </p>
          <div className="mt-7 flex flex-col items-start gap-3 text-sm">
            <Link className={`inline-flex items-center gap-1.5 ${LINK}`} href="/blocks">
              Browse the Blocks your {several ? "keys unlock" : "key unlocks"}
              <ArrowRightIcon aria-hidden className="size-3.5" />
            </Link>
            {several ? null : (
              <Link className={`inline-flex items-center gap-1.5 ${LINK}`} href={BUY_HREF}>
                <PlusIcon aria-hidden className="size-3.5" />
                Add a license for another developer
              </Link>
            )}
          </div>
        </div>
        {several ? (
          <LicenseSummary count={rows.length} licensedTo={licensedTo} />
        ) : (
          <KeySurface index={0} license={active} licensedTo={licensedTo} total={1} />
        )}
      </div>

      {several ? (
        <div className="l-row px-6 pb-14 sm:px-8 sm:pb-20">
          <KeyLedger activeKey={active.key} rows={rows} />
        </div>
      ) : null}

      <section aria-labelledby="setup-title" className="border-t border-border">
        <div className={`l-row grid grid-cols-1 gap-10 px-6 py-14 sm:px-8 sm:py-20 ${COLUMNS}`}>
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl" id="setup-title">
              Set up a project
            </h2>
            <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">
              Three steps, once per project{several ? ", with the key of the developer doing the install." : "."}
            </p>
            {several ? (
              <div className="mt-6 flex max-w-sm flex-col gap-2">
                <span className="text-sm font-medium" id="setup-key-label">
                  Key in the .env step
                </span>
                <Select
                  items={keyItems}
                  onValueChange={(value) => {
                    if (typeof value === "string") setSelectedKey(value);
                  }}
                  value={active.key}
                >
                  <SelectTrigger aria-labelledby="setup-key-label" className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {keyItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="mt-8 grid max-w-sm grid-cols-1 gap-6 border-t border-border pt-6 text-sm">
              <div>
                <h3 className="font-medium">Keep the key out of git</h3>
                <p className="mt-1.5 leading-relaxed text-pretty text-muted-foreground">
                  It goes in <code className="font-mono text-[0.9em] text-foreground">.env</code> or your CI secrets,
                  never in <code className="font-mono text-[0.9em] text-foreground">components.json</code> itself.
                  Anyone holding it installs as you.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Refunds</h3>
                <p className="mt-1.5 leading-relaxed text-pretty text-muted-foreground">
                  Within 14 days of purchase. A refund revokes {several ? "that key" : "the key"}.{" "}
                  <Link className={LINK} href="/terms">
                    Terms
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            {several ? (
              <p className="mb-6 text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">{keyName(activeIndex)}</span>
              </p>
            ) : null}
            <SetupSteps displayKey={active.displayKey} licenseKey={active.key} />
          </div>
        </div>
      </section>
    </>
  );
}

/** The account's licenses at a glance: seat count, the terms every key shares, and the way to add one. */
function LicenseSummary({ count, licensedTo }: { count: number; licensedTo: string }) {
  return (
    <article aria-label="License summary" className={SURFACE}>
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Logomark className="size-4" />
          SevenUI Pro
        </span>
        <span className="text-xs text-muted-foreground">Lifetime · per developer</span>
      </header>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-5 pt-5 pb-6">
        <p className="flex items-baseline gap-3">
          <span className="text-[3.5rem] leading-none font-semibold tracking-[-0.04em] tabular-nums">{count}</span>
          <span className="text-sm text-muted-foreground">
            licenses
            <br />
            {count} developer seats
          </span>
        </p>
        <Link className={buttonVariants({ variant: "outline", className: "h-9 px-3" })} href={BUY_HREF}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          Add a license
        </Link>
      </div>
      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border text-sm sm:grid-cols-4">
        {[
          ["Licensed to", licensedTo],
          ["Term", "Lifetime"],
          ["Seats", `${count} developers`],
          ["Projects", "Unlimited"],
        ].map(([term, value]) => (
          <div className="flex min-w-0 flex-col gap-0.5 bg-card px-5 py-3" key={term}>
            <dt className="text-xs text-muted-foreground">{term}</dt>
            <dd className="truncate font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function NoLicense({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  const [checking, setChecking] = React.useState(false);
  return (
    <Split aside={<LockedKey caption="Your key appears here the moment checkout completes." />}>
      <h1 className={TITLE}>{failed ? "We couldn't check your licenses." : "No license on this account yet."}</h1>
      <p className={LEAD}>
        {failed
          ? "The license service didn't answer just now. If you already bought Pro, try again; if you haven't, it's $99 at launch instead of $249 — lifetime, per developer, every Block."
          : "SevenUI Pro is $99 at launch instead of $249 — lifetime, per developer, every Block. Your key shows here the moment checkout completes."}
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-3">
        {failed ? (
          <>
            <Button
              aria-disabled={checking || undefined}
              className="h-10 min-w-32 px-5"
              onClick={() => {
                if (checking) return;
                setChecking(true);
                onRetry();
              }}
              size="lg"
              type="button"
            >
              {checking ? <Spinner aria-hidden data-icon="inline-start" role="presentation" /> : null}
              {checking ? "Checking…" : "Try again"}
            </Button>
            <Link className={buttonVariants({ variant: "outline", size: "lg", className: "h-10 px-5" })} href={BUY_HREF}>
              Get Pro — $99
            </Link>
          </>
        ) : (
          <Link className={buttonVariants({ size: "lg", className: "h-10 px-5" })} href={BUY_HREF}>
            Get Pro — $99
          </Link>
        )}
      </div>
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">{RECEIPT_NOTE}</p>
    </Split>
  );
}
