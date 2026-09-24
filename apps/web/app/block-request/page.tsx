import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "lucide-react";
import { JsonLd } from "../../components/json-ld";
import { LegalPage } from "../../components/legal-page";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";

const ROUTE = "/block-request";
const UPDATED = "September 25, 2026";

const EMAIL = "mail@sevenui.dev";
const SUBJECT = "Block Request";
const BODY = [
  "What the Block is for:",
  "",
  "References (screenshots, links, sketches):",
  "",
  "Content and states:",
  "",
  "Framework and variants:",
  "",
].join("\n");
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;

// `.legal a` is unlayered CSS, so the button's own colors need `!` to win over it.
const BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground! no-underline! transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/block-request/page.tsx");
  return pageMetadata(ROUTE, meta.title, meta.description);
}

export default async function BlockRequestPage() {
  const meta = await requirePageMeta(ROUTE, "app/block-request/page.tsx");

  return (
    <main id="content">
      <LegalPage title={meta.title} updated={UPDATED}>
        <p>
          Need a Block that isn't in the catalog yet? If you hold a <strong>SevenUI Pro</strong> license, you can
          request one built around your use case. Tell us what you are making, and we'll consider it for the Pro
          catalog.
        </p>
        <p>
          Not a Pro customer yet? <Link href="/pro">See what SevenUI Pro includes</Link>.
        </p>

        <h2>How to send a request</h2>
        <p>
          Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> from the <strong>same email address you used to buy your
          license</strong>. That is how we match the request to your license — we can't verify requests sent from
          other addresses.
        </p>
        <p>
          <a className={BUTTON} href={MAILTO}>
            <MailIcon aria-hidden="true" className="size-4" />
            Email a block request
          </a>
        </p>

        <h2>What to include</h2>
        <p>The more concrete the request, the closer the result. A useful request covers:</p>
        <ul>
          <li>
            <strong>What it's for</strong> — the use case, the page or section it belongs to, and who uses it.
          </li>
          <li>
            <strong>References</strong> — screenshots, links to sites or designs you like, or a rough sketch.
          </li>
          <li>
            <strong>Content and states</strong> — the data it shows, and any empty, loading, or error states you
            need.
          </li>
          <li>
            <strong>Framework and variants</strong> — the framework you use (Next.js, Vite, …) and the variants you
            need, such as alternate layouts or specific breakpoints.
          </li>
        </ul>

        <h2>What happens next</h2>
        <p>
          We read every request and reply to the address you wrote from. Requests shape what we build next, but we
          can't promise that a specific Block will be built, or by when — see section 3 of the{" "}
          <Link href="/terms">Terms</Link>. When a requested Block ships, it joins the Pro catalog and installs with
          your existing key like any other Block.
        </p>

        <p className="mt-12! border-t border-border pt-4 text-xs! leading-relaxed">
          If you submit a Block request and the Block you requested is added to the Pro catalog, your purchase is no
          longer eligible for a refund, including within the 14-day refund window described in the{" "}
          <Link href="/terms">Terms</Link>.
        </p>
      </LegalPage>
      <JsonLd route={ROUTE} />
    </main>
  );
}
