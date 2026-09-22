import type { Metadata } from "next";
import { AccountPanel } from "../../components/account/account-panel";
import { JsonLd } from "../../components/json-ld";
import { LandingRuler } from "../../components/landing-ruler";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";

const ROUTE = "/account";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/account/page.tsx");
  return pageMetadata(ROUTE, meta.title, meta.description);
}

export default function AccountPage() {
  return (
    <main id="content">
      <div className="relative">
        <LandingRuler />

        <section className="border-b border-border">
          <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
            <span>Account</span>
            <span className="text-end">License & sign-in</span>
          </div>
          <AccountPanel />
        </section>
      </div>
      <JsonLd route={ROUTE} />
    </main>
  );
}
