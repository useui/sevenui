"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as CookieConsent from "vanilla-cookieconsent";
import { isShellRoute } from "../lib/site-tabs";
import { Logomark } from "./logomark";
import { GithubMark, outlineButton } from "./site-actions";
import { ThemeSwitch } from "./theme-switch";

const footerPrimitives = ["button", "input", "select", "combobox", "checkbox", "switch", "slider", "table"];

const linkClass = "inline-flex items-center gap-1 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground";
const viewAllClass = "inline-flex items-center gap-1 py-1.5 font-medium text-foreground text-sm";

type FooterLink = { label: string; href: string; external?: boolean };

const productLinks: FooterLink[] = [
  { label: "Blocks", href: "/blocks" },
  { label: "Pro", href: "/pro" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Block Request", href: "/block-request" },
];

const resourceLinks: FooterLink[] = [
  { label: "Introduction", href: "/docs" },
  { label: "Installation", href: "/docs/installation" },
  { label: "Theming", href: "/docs/theming" },
  { label: "Support", href: "/support" },
  { label: "llms.txt", href: "/llms.txt", external: true },
];

const builtOnLinks: FooterLink[] = [
  { label: "Base UI", href: "https://base-ui.com", external: true },
  { label: "UI SDK", href: "https://ui-sdk.dev", external: true },
  { label: "shadcn registry", href: "https://ui.shadcn.com/docs/registry", external: true },
  { label: "Tailwind CSS", href: "https://tailwindcss.com", external: true },
];

export type FooterFamily = { id: string; label: string };

function FooterNav({
  label,
  links,
  viewAll,
}: {
  label: string;
  links: FooterLink[];
  viewAll?: { href: string; count: number };
}) {
  return (
    <nav aria-label={label} className="flex flex-col items-start">
      <span className="mb-3 font-semibold text-docs-tertiary text-xs uppercase tracking-[0.3px]">{label}</span>
      {links.map((link) =>
        link.external ? (
          // Plain anchors: off-site links, and llms.txt is a route handler, not a page.
          <a
            className={linkClass}
            href={link.href}
            key={link.href}
            {...(link.href.startsWith("http") ? { rel: "noopener noreferrer", target: "_blank" } : {})}
          >
            {link.label}
          </a>
        ) : (
          <Link className={linkClass} href={link.href} key={link.href}>
            {link.label}
          </Link>
        ),
      )}
      {viewAll && (
        <Link className={viewAllClass} href={viewAll.href}>
          View all <span className="text-docs-tertiary">({viewAll.count})</span>
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      )}
    </nav>
  );
}

export function SiteFooter({
  componentCount,
  componentFamilies,
  primitiveCount,
  primitivesHref,
}: {
  componentCount: number;
  componentFamilies: FooterFamily[];
  primitiveCount: number;
  primitivesHref: string;
}) {
  const pathname = usePathname();
  const framed = pathname === "/";

  // The shell sections end on their own content: the sidebar card already carries every link this footer would.
  if (isShellRoute(pathname)) return null;

  const primitiveLinks: FooterLink[] = footerPrimitives.map((name) => ({
    label: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
    href: `/docs/components/${name}`,
  }));

  const familyLinks: FooterLink[] = componentFamilies.map((family) => ({
    label: family.label,
    href: `/components#${family.id}`,
  }));

  const body = (
    <>
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div>
          <Link aria-label="SevenUI home" className="inline-flex text-foreground" href="/">
            <Logomark className="h-6 w-auto" />
          </Link>
          <p className="mt-3.5 max-w-[27rem] font-medium text-muted-foreground text-sm">
            SevenUI is a set of Base UI and UI SDK components for shadcn/ui, built for teams and their agents and
            distributed through the shadcn registry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            className={`${outlineButton} px-3`}
            href="https://github.com/useui/sevenui"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubMark />
            GitHub
          </a>
          <Link className={`${outlineButton} px-3`} href="/pro">
            <Logomark className="h-3.5 w-auto shrink-0" />
            Get Pro
          </Link>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        <FooterNav label="Primitives" links={primitiveLinks} viewAll={{ href: primitivesHref, count: primitiveCount }} />
        <FooterNav label="Components" links={familyLinks} viewAll={{ href: "/components", count: componentCount }} />
        <FooterNav label="Product" links={productLinks} />
        <FooterNav label="Resources" links={resourceLinks} />
        <FooterNav label="Built on" links={builtOnLinks} />
      </div>
    </>
  );

  const legal = (
    <>
      <ThemeSwitch />
      <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
        <span>MIT License © 2026 SevenUI</span>
        <span aria-hidden="true">·</span>
        <Link className="transition-colors hover:text-foreground" href="/terms">
          Terms
        </Link>
        <span aria-hidden="true">·</span>
        <Link className="transition-colors hover:text-foreground" href="/privacy">
          Privacy
        </Link>
        <span aria-hidden="true">·</span>
        <button className="cursor-pointer transition-colors hover:text-foreground" onClick={() => CookieConsent.showPreferences()} type="button">
          Cookie settings
        </button>
      </nav>
    </>
  );

  // A soft tinted surface inset from the viewport edges, in place of hairline rules above and inside it.
  const SURFACE = "mx-3 mb-3 rounded-3xl bg-muted/50 sm:mx-4 sm:mb-4";
  const legalRow = "flex flex-col gap-3 py-4 text-docs-tertiary text-xs sm:flex-row sm:items-center sm:justify-between";

  if (framed) {
    return (
      <footer className={SURFACE}>
        <div className="l-row">
          <div className="px-6 pt-14 pb-10">{body}</div>
        </div>
        <div>
          <div className={`l-row px-6 ${legalRow}`}>{legal}</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={SURFACE}>
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">{body}</div>
      <div>
        <div className={`mx-auto max-w-6xl px-6 ${legalRow}`}>{legal}</div>
      </div>
    </footer>
  );
}
