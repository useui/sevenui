import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRightIcon, MailIcon } from "lucide-react";
import { JsonLd } from "../../components/json-ld";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";
import { FAQ, ISSUES_URL } from "./faq";

const ROUTE = "/support";

const EMAIL = "mail@sevenui.dev";
const MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent("Support")}`;

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
