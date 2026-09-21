import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { BuyLink } from "../../components/pro/buy-link";
import { JsonLd } from "../../components/json-ld";
import { LandingRuler } from "../../components/landing-ruler";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";

// Ported from `legacy-pages/pro.astro`. The header, drawer, footer, theme
// provider and skip link are `app/layout.tsx`'s job (§11.1) — this page
// renders only its own section content, the same shape `app/privacy/page.tsx`
// and `app/account/page.tsx` use.
//
// Nothing on this page is gated (task addendum A) — the hero, the catalog
// grid, the pricing band, the feature list and the checkout link are all
// plain server-rendered markup. Clerk touches exactly one thing, the
// checkout link's query string, and that lives entirely in
// `components/pro/buy-link.tsx`, a small `"use client"` island. This file
// stays a plain server component so `/pro` builds as a prerendered route
// (`○`): no `cookies()`, no `headers()`, no `dynamic = "force-dynamic"`.

const ROUTE = "/pro";

// Sandbox link until production cutover — the ONLY place the checkout URL
// lives (task addendum C). `<BuyLink>` receives it as a prop and enhances
// the URL it is given; it does not know or store which URL that is.
const CHECKOUT_URL = "https://buy.polar.sh/polar_cl_EFc9Cc5sEoAjEz4MBrNwWu5UWgdnAMC0cRwyT2n1aZF";

// Copy is not migration territory (spec addendum D) — every string below is
// reproduced verbatim from `legacy-pages/pro.astro`.
const features = [
  "Every Pro block, delivered to your license as the catalog rolls out",
  "Lifetime access — pay once, keep forever",
  "Locks in $99 before the price rises to $249 at launch",
  "License key issued immediately — view it anytime in your account",
];

// The upcoming catalog, drawn in the same wireframe idiom as the blocks
// gallery's category illustrations. Names are the promise; the drawings are
// deliberately unfinished — the catalog is in production.
const catalog = [
  { id: "dashboards", label: "Dashboards" },
  { id: "app-shells", label: "App shells" },
  { id: "settings", label: "Settings" },
  { id: "onboarding", label: "Onboarding" },
  { id: "data-tables", label: "Data tables" },
  { id: "billing", label: "Billing" },
];

// `/pro` has been in `lib/page-meta.ts` since Task 1.7, with its description
// copied from the live page's own `<meta name="description">` — this page
// reads that entry, it does not add or rewrite it. `pro.astro`'s own local
// `const description` was that same string, made redundant here.
// `pageMetadata` applies the em-dash suffix in the one place it is ever
// applied (§15.8, §16.8) and builds the full `og:*`/`twitter:*` set
// (task-9.2b).
export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/pro/page.tsx");
  return pageMetadata(ROUTE, meta.title, meta.description);
}

export default function ProPage() {
  return (
    <>
      <div className="relative">
        <LandingRuler />

        <section className="border-b border-border">
          <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
            <span>SevenUI Pro</span>
            <span className="text-end">Pre-order open — $99 until catalog launch</span>
          </div>
          <div className="l-row flex flex-col items-center px-6 pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
            <h1 className="hero-rise text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              The application layer
              <br />
              is coming.
            </h1>
            <p className="hero-rise hero-rise-2 mt-6 max-w-xl text-lg text-balance text-muted-foreground">
              Dashboards, app shells, settings, onboarding — full application blocks on the same Base UI foundation,
              delivered straight to your license as they ship.
            </p>
            <div className="hero-rise hero-rise-3 mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <a
                className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                href="#pre-order"
              >
                Pre-order — $99
              </a>
              <span className="font-mono text-xs text-muted-foreground">
                <s aria-hidden="true">$249</s> at launch
              </span>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
            <span>In production</span>
            <span className="text-end">First delivery ships to every pre-order</span>
          </div>
          <div className="l-row">
            <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((entry, i) => (
                <li
                  className="catalog-cell bg-background"
                  key={entry.id}
                  style={{ "--draw-delay": `${i * 0.12}s` } as CSSProperties}
                >
                  <div className="flex aspect-[11/6] items-center justify-center px-8 py-6">
                    <div className="h-full w-full max-w-[220px]">{catalogArt[entry.id]}</div>
                  </div>
                  <div className="border-t border-border px-6 py-3">
                    <span className="text-sm font-medium">{entry.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="scroll-mt-16" id="pre-order">
          <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
            <span>Lifetime license</span>
            <span className="text-end">One developer — unlimited projects</span>
          </div>
          <div className="l-row grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <div className="px-6 py-10 sm:px-10">
              <p className="text-5xl font-semibold tracking-tight">
                $99
                <span className="ml-2 align-middle font-mono text-sm font-normal text-muted-foreground">
                  <s aria-hidden="true">$249</s> pre-order
                </span>
              </p>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                Buy now for $99, once, and it's yours forever. The price becomes $249 the moment the Pro blocks
                catalog launches — pre-ordering locks in today's price. Your license key is issued immediately, and
                every Pro block ships to it automatically as the catalog rolls out.
              </p>
              <p className="mt-6 max-w-md text-xs leading-relaxed text-muted-foreground">
                One license per developer, unlimited personal and commercial projects. Redistribution or resale of
                the source is not permitted.
              </p>
            </div>
            <div className="flex flex-col justify-between px-6 py-10 sm:px-10">
              <ul className="divide-y divide-border text-sm">
                {features.map((feature) => (
                  <li className="flex items-start gap-3 py-3 first:pt-0" key={feature}>
                    <svg
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <BuyLink checkoutUrl={CHECKOUT_URL} />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Your key lives in{" "}
                  <a className="underline underline-offset-4" href="/account">
                    your account
                  </a>{" "}
                  the moment checkout completes.
                </p>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  By pre-ordering you agree to the{" "}
                  <a className="underline underline-offset-4" href="/terms">
                    Terms
                  </a>
                  . Refundable within 14 days.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <JsonLd route={ROUTE} />
    </>
  );
}

// The six catalog SVGs are art assets, not logic (task addendum D): ported
// faithfully, attribute for attribute, from `legacy-pages/pro.astro`'s
// `entry.id === "dashboards" ? … : …` chain — a five-deep nested ternary
// that existed only because Astro had no better tool. Keyed off the entry id
// through this plain lookup instead of reproducing that chain.
const catalogArt: Record<string, ReactNode> = {
  dashboards: <DashboardsArt />,
  "app-shells": <AppShellsArt />,
  settings: <SettingsArt />,
  onboarding: <OnboardingArt />,
  "data-tables": <DataTablesArt />,
  billing: <BillingArt />,
};

function DashboardsArt() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 220 120">
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="92"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="40"
        x="14"
        y="14"
      />
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="28"
        pathLength="1"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        width="42"
        x="66"
        y="14"
      />
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="28"
        pathLength="1"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        width="42"
        x="116"
        y="14"
      />
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="28"
        pathLength="1"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        width="40"
        x="166"
        y="14"
      />
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="54"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="140"
        x="66"
        y="52"
      />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="80" x="76" y="64" />
      <rect
        className="ink text-muted-foreground/30"
        fill="currentColor"
        height="6"
        rx="3"
        width="120"
        x="76"
        y="78"
      />
      <rect
        className="ink text-muted-foreground/30"
        fill="currentColor"
        height="6"
        rx="3"
        width="100"
        x="76"
        y="92"
      />
    </svg>
  );
}

function AppShellsArt() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 220 120">
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="16"
        pathLength="1"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
        width="192"
        x="14"
        y="14"
      />
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="68"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="48"
        x="14"
        y="38"
      />
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="68"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="136"
        x="70"
        y="38"
      />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="32" x="22" y="48" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="32" x="22" y="60" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="32" x="22" y="72" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="8" rx="4" width="90" x="80" y="50" />
      <rect
        className="ink text-muted-foreground/30"
        fill="currentColor"
        height="6"
        rx="3"
        width="116"
        x="80"
        y="66"
      />
    </svg>
  );
}

function SettingsArt() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 220 120">
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="80"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="54"
        x="14"
        y="20"
      />
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="80"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="126"
        x="80"
        y="20"
      />
      <rect className="ink text-muted-foreground/50" fill="currentColor" height="6" rx="3" width="38" x="22" y="32" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="38" x="22" y="46" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="38" x="22" y="60" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="60" x="92" y="36" />
      <circle
        className="draw text-muted-foreground/40"
        cx="188"
        cy="39"
        fill="none"
        pathLength="1"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="60" x="92" y="58" />
      <circle
        className="draw text-muted-foreground/40"
        cx="188"
        cy="61"
        fill="none"
        pathLength="1"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="60" x="92" y="80" />
      <circle
        className="draw text-muted-foreground/40"
        cx="188"
        cy="83"
        fill="none"
        pathLength="1"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function OnboardingArt() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 220 120">
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="80"
        pathLength="1"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
        width="100"
        x="60"
        y="14"
      />
      <rect className="ink text-muted-foreground/50" fill="currentColor" height="8" rx="4" width="68" x="76" y="30" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="68" x="76" y="46" />
      <rect
        className="ink text-muted-foreground/50"
        fill="currentColor"
        height="12"
        rx="6"
        width="68"
        x="76"
        y="70"
      />
      <circle className="ink text-muted-foreground/50" cx="94" cy="106" fill="currentColor" r="4" />
      <circle
        className="draw text-muted-foreground/40"
        cx="110"
        cy="106"
        fill="none"
        pathLength="1"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        className="draw text-muted-foreground/40"
        cx="126"
        cy="106"
        fill="none"
        pathLength="1"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function DataTablesArt() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 220 120">
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="92"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="192"
        x="14"
        y="14"
      />
      <rect className="ink text-muted-foreground/50" fill="currentColor" height="8" rx="4" width="60" x="26" y="26" />
      <line
        className="draw text-muted-foreground/30"
        pathLength="1"
        stroke="currentColor"
        strokeWidth="2"
        x1="14"
        x2="206"
        y1="46"
        y2="46"
      />
      <rect
        className="ink text-muted-foreground/30"
        fill="currentColor"
        height="6"
        rx="3"
        width="120"
        x="26"
        y="56"
      />
      <rect
        className="ink text-muted-foreground/30"
        fill="currentColor"
        height="6"
        rx="3"
        width="150"
        x="26"
        y="72"
      />
      <rect
        className="ink text-muted-foreground/30"
        fill="currentColor"
        height="6"
        rx="3"
        width="100"
        x="26"
        y="88"
      />
    </svg>
  );
}

function BillingArt() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 220 120">
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="92"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="110"
        x="14"
        y="14"
      />
      <rect className="ink text-muted-foreground/50" fill="currentColor" height="8" rx="4" width="50" x="26" y="28" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="86" x="26" y="48" />
      <rect className="ink text-muted-foreground/30" fill="currentColor" height="6" rx="3" width="86" x="26" y="62" />
      <line
        className="draw text-muted-foreground/30"
        pathLength="1"
        stroke="currentColor"
        strokeWidth="2"
        x1="26"
        x2="112"
        y1="84"
        y2="84"
      />
      <rect className="ink text-muted-foreground/50" fill="currentColor" height="6" rx="3" width="56" x="26" y="92" />
      <rect
        className="draw text-muted-foreground/40"
        fill="none"
        height="52"
        pathLength="1"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="70"
        x="136"
        y="34"
      />
      <rect
        className="ink text-muted-foreground/30"
        fill="currentColor"
        height="6"
        rx="3"
        width="40"
        x="146"
        y="46"
      />
      <rect
        className="ink text-muted-foreground/50"
        fill="currentColor"
        height="10"
        rx="5"
        width="50"
        x="146"
        y="60"
      />
    </svg>
  );
}
