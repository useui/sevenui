import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRightIcon, MailIcon } from "lucide-react";
import { JsonLd } from "../../components/json-ld";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";

const ROUTE = "/support";

const EMAIL = "mail@sevenui.dev";
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent("Support")}`;
const ISSUES_URL = "https://github.com/useui/sevenui/issues";

// `.legal a` is unlayered CSS, so the button's own colors need `!` to win over it.
const BUTTON =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground! no-underline! transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const CARD =
  "flex h-full flex-col gap-1 rounded-lg border border-border px-4 py-3 no-underline! transition-colors hover:border-foreground/35 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

type QuickLink = { label: string; href: string; description: string; external?: boolean };

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Installation",
    href: "/docs/installation",
    description: "Set up the shadcn CLI and add your first primitive.",
  },
  { label: "Theming", href: "/docs/theming", description: "How primitives pick up your shadcn theme." },
  { label: "Primitives", href: "/docs/components", description: "Every primitive, with usage and API notes." },
  { label: "Components", href: "/components", description: "Free, copy-and-go compositions of the primitives." },
  { label: "Blocks", href: "/blocks", description: "The Pro catalog of full sections and pages." },
  { label: "Pro setup", href: "/pro#setup", description: "Put your license key to work in three steps." },
  { label: "Block Request", href: "/block-request", description: "Ask for a Block that isn't in the catalog yet." },
  { label: "Roadmap", href: "/roadmap", description: "What's coming next, and what shipped when." },
  {
    label: "GitHub issues",
    href: ISSUES_URL,
    description: "Report a bug in a free primitive or component.",
    external: true,
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "How do I install SevenUI?",
    a: (
      <>
        With the shadcn CLI, in a project that already runs it with Tailwind CSS v4:{" "}
        <code>npx shadcn@latest add @sevenui/button</code>. The <code>@sevenui</code> namespace is in the shadcn
        registry index, so no extra configuration is needed. See <Link href="/docs/installation">Installation</Link>.
      </>
    ),
  },
  {
    q: "How do I set up my Pro license key?",
    a: (
      <>
        Put it in your environment as <code>SEVENUI_PRO_KEY</code>, add an <code>Authorization</code> header for the{" "}
        <code>@sevenui</code> registry in <code>components.json</code>, then install any Block by name, e.g.{" "}
        <code>npx shadcn@latest add @sevenui/pro/dashboard-01</code>. The <Link href="/pro#setup">setup steps</Link>{" "}
        have the exact snippet to copy.
      </>
    ),
  },
  {
    q: "Where do I find my license key?",
    a: (
      <>
        Sign in to <Link href="/account">your account</Link> with the email you paid with and copy it from there.
        It's also in the receipt email from Polar.
      </>
    ),
  },
  {
    q: "Installing a Pro Block fails with 401 or 403. What now?",
    a: (
      <>
        A <strong>401</strong> means no key reached the registry: check that <code>SEVENUI_PRO_KEY</code> is set in
        the shell or environment where you run the CLI, and that <code>components.json</code> sends the header. A{" "}
        <strong>403</strong> means the key was rejected — it was mistyped, or it's been revoked (for example after a
        refund). Copy it again from <Link href="/account">your account</Link>; if it still fails, email us.
      </>
    ),
  },
  {
    q: "I got a 429 “Rate limit exceeded” error.",
    a: "Each license key can install up to 100 Blocks per minute. The error tells you how many seconds to wait; after that, installs work again. Normal use rarely gets close — if you hit it without scripting installs, let us know.",
  },
  {
    q: "Can I get a refund?",
    a: (
      <>
        Yes, within 14 days of purchase, for any reason: email us from your account's address, or ask Polar directly.
        One exception: if you requested a Block and it was added to the catalog, the purchase is no longer
        refundable. See section 5 of the <Link href="/terms">Terms</Link>.
      </>
    ),
  },
  {
    q: "Can my whole team use one license?",
    a: (
      <>
        No — a license covers one developer, so a team buys one per developer working with the Pro source. Team
        licenses are on the <Link href="/roadmap">roadmap</Link>. More in the <Link href="/pro#faq">Pro FAQ</Link>.
      </>
    ),
  },
  {
    q: "How do I request a new Block?",
    a: (
      <>
        Pro license holders can email a request from the address they paid with. See{" "}
        <Link href="/block-request">Block Request</Link> for what to include.
      </>
    ),
  },
  {
    q: "Where do I report a bug?",
    a: (
      <>
        Bugs in the free primitives and components go to{" "}
        <a href={ISSUES_URL} rel="noopener noreferrer" target="_blank">
          GitHub issues
        </a>
        . For Pro Blocks, email us with the Block name and what you saw. Found a security issue? Email us before
        disclosing it.
      </>
    ),
  },
];

/** The small mono label that opens each part of the page. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{children}</p>;
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/support/page.tsx");
  return pageMetadata(ROUTE, meta.title, meta.description);
}

export default async function SupportPage() {
  const meta = await requirePageMeta(ROUTE, "app/support/page.tsx");

  return (
    <main id="content">
      <section className="border-b border-border">
        <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
          <span>{meta.title}</span>
          <span className="text-end">{EMAIL}</span>
        </div>
        <div className="l-row">
          <div className="legal mx-auto max-w-[68ch] px-6 py-14 sm:px-10">
            <h1>{meta.title}</h1>
            <p>
              Questions about installing SevenUI, your Pro license, or a Block that isn't behaving? Email us at{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and a person will reply to the address you wrote from.
            </p>
            <p>
              <strong>Pro customers:</strong> write from the email you used to buy your license. That's how we find
              your license and help faster.
            </p>
            <p>
              <a className={BUTTON} href={MAILTO}>
                <MailIcon aria-hidden="true" className="size-4" />
                Email support
              </a>
            </p>

            <section aria-labelledby="links-title" className="mt-14 border-t border-border pt-10" id="links">
              <Eyebrow>Self-serve</Eyebrow>
              {/* `.legal` sets heading margins unlayered, so utilities cannot override them. */}
              <h2 id="links-title" style={{ marginTop: "0.75rem" }}>
                Find answers fast
              </h2>
              <nav aria-labelledby="links-title" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {QUICK_LINKS.map((link) => {
                  const body = (
                    <>
                      <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                        {link.label}
                        {link.external ? (
                          <ArrowUpRightIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
                        ) : null}
                      </span>
                      <span className="text-sm leading-snug text-muted-foreground">{link.description}</span>
                    </>
                  );
                  return link.external ? (
                    <a className={CARD} href={link.href} key={link.href} rel="noopener noreferrer" target="_blank">
                      {body}
                    </a>
                  ) : (
                    <Link className={CARD} href={link.href} key={link.href}>
                      {body}
                    </Link>
                  );
                })}
              </nav>
            </section>

            <section aria-labelledby="faq-title" className="mt-14 scroll-mt-20 border-t border-border pt-10" id="faq">
              <Eyebrow>FAQ</Eyebrow>
              <h2 id="faq-title" style={{ marginTop: "0.75rem" }}>
                Common questions
              </h2>
              <dl className="divide-y divide-border border-y border-border" style={{ marginTop: "1.5rem" }}>
                {FAQ.map((entry) => (
                  <div className="py-5" key={entry.q}>
                    <dt className="font-medium text-foreground">{entry.q}</dt>
                    <dd className="mt-1.5">{entry.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <p className="mt-12!">
              Still stuck? <a href={MAILTO}>Email {EMAIL}</a> with what you ran and the full error message.
            </p>
          </div>
        </div>
      </section>
      <JsonLd route={ROUTE} />
    </main>
  );
}
