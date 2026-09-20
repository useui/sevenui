import type { Metadata } from "next";
import { AccountPanel } from "../../components/account/account-panel";
import { JsonLd } from "../../components/json-ld";
import { LandingRuler } from "../../components/landing-ruler";
import { requirePageMeta } from "../../lib/page-meta";
import { pageTitle } from "../../lib/site";

// Ported from `legacy-pages/account.astro`. The header, drawer, footer,
// theme provider and skip link are `app/layout.tsx`'s job (§11.1) — this
// page renders only its own section, the same shape `app/privacy/page.tsx`
// uses. Everything below the "Account" strip is `<AccountPanel>`'s job
// (task 6.2 addendum C): a server component cannot render the license list
// itself (task 6.2 step 1 — that needs a Bearer token minted from a Clerk
// *browser* session, which means `@clerk/clerk-js` in the browser, not the
// `@clerk/nextjs` `auth()` Task 6.1 declined), so this file stays the thin
// server half: metadata, the exposed-grid chrome, and the JSON-LD mount.

const ROUTE = "/account";

// `/account` has been in `lib/page-meta.ts` since Task 1.7, with a recorded
// reason its description reuses `site.description` rather than a
// page-specific string — this page reads that entry, it does not add or
// rewrite it. `pageTitle` applies the em-dash suffix in the one place it is
// ever applied (§15.8, §16.8).
//
// No `openGraph` block, following Task 4.1: the OG surface is Stage 9's.
export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/account/page.tsx");
  return { title: pageTitle(meta.title), description: meta.description };
}

export default function AccountPage() {
  return (
    <>
      <div className="relative">
        <LandingRuler />

        <section className="border-b border-border">
          {/* "Account" is a literal here, not `meta.title`, matching the
              source: the live page's own strip never read its title from
              page config either — see `legacy-pages/account.astro:44`. */}
          <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
            <span>Account</span>
            <span className="text-end">License & sign-in</span>
          </div>
          <AccountPanel />
        </section>
      </div>
      <JsonLd route={ROUTE} />
    </>
  );
}
