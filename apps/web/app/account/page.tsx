import type { Metadata } from "next";
import { AccountPanel } from "../../components/account/account-panel";
import { JsonLd } from "../../components/json-ld";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";

const ROUTE = "/account";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/account/page.tsx");
  // A signed-in view with nothing for a search visitor: kept out of the index and the sitemap.
  return pageMetadata(ROUTE, meta.title, meta.description, { noindex: true });
}

export default function AccountPage() {
  return (
    <main className="sv-page" id="content">
      <AccountPanel />
      <JsonLd route={ROUTE} />
    </main>
  );
}
