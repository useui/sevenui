"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as CookieConsent from "vanilla-cookieconsent";
import { Logomark } from "./logomark";

const footerPrimitives = ["button", "input", "select", "combobox", "checkbox", "switch", "slider", "table"];

const linkClass = "inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground";

type FooterLink = { label: string; href: string; external?: boolean; arrow?: boolean };

const productLinks: FooterLink[] = [
  { label: "Components", href: "/components" },
  { label: "Blocks", href: "/blocks" },
  { label: "Pro", href: "/pro" },
  { label: "Roadmap", href: "/roadmap" },
];

const resourceLinks: FooterLink[] = [
  { label: "Introduction", href: "/docs" },
  { label: "Installation", href: "/docs/installation" },
  { label: "Theming", href: "/docs/theming" },
  { label: "Block Request", href: "/block-request" },
  { label: "Support", href: "/support" },
  { label: "llms.txt", href: "/llms.txt", external: true },
  { label: "GitHub", href: "https://github.com/useui/sevenui", external: true },
];

const builtOnLinks: FooterLink[] = [
  { label: "Base UI", href: "https://base-ui.com", external: true },
  { label: "shadcn registry", href: "https://ui.shadcn.com/docs/registry", external: true },
  { label: "Tailwind CSS", href: "https://tailwindcss.com", external: true },
];

function FooterNav({ label, links }: { label: string; links: FooterLink[] }) {
  return (
    <nav aria-label={label} className="flex flex-col items-start gap-2 text-sm">
      <span className="mb-1 font-medium">{label}</span>
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
            {link.arrow && <ArrowRight aria-hidden="true" className="size-3.5" />}
          </Link>
        ),
      )}
    </nav>
  );
}

export function SiteFooter({ primitivesHref }: { primitivesHref: string }) {
  const framed = usePathname() === "/";

  const primitiveLinks: FooterLink[] = [
    ...footerPrimitives.map((name) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
      href: `/docs/components/${name}`,
    })),
    { label: "All primitives", href: primitivesHref, arrow: true },
  ];

  const columns = (
    <>
      <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
        <span className="inline-flex items-center gap-2 font-semibold">
          <Logomark className="h-5 w-auto" /> SevenUI
        </span>
        <p className="max-w-xs text-sm text-muted-foreground">
          <span className="block font-medium text-foreground">Copy it. Own it. Ship it.</span>
          Base UI powered primitives, distributed through the shadcn registry.
        </p>
      </div>
      <FooterNav label="Primitives" links={primitiveLinks} />
      <FooterNav label="Product" links={productLinks} />
      <FooterNav label="Resources" links={resourceLinks} />
      <FooterNav label="Built on" links={builtOnLinks} />
    </>
  );

  const legal = (
    <>
      <p>MIT License © 2026 SevenUI</p>
      <nav aria-label="Legal" className="flex items-center gap-4">
        <Link className="transition-colors hover:text-foreground" href="/terms">
          Terms
        </Link>
        <Link className="transition-colors hover:text-foreground" href="/privacy">
          Privacy
        </Link>
        <button className="cursor-pointer transition-colors hover:text-foreground" onClick={() => CookieConsent.showPreferences()} type="button">
          Cookie settings
        </button>
      </nav>
    </>
  );

  if (framed) {
    return (
      <footer>
        <div className="l-row l-marks">
          <div className="grid w-full gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">{columns}</div>
        </div>
        <div className="border-t border-border">
          <div className="l-row flex flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            {legal}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">{columns}</div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          {legal}
        </div>
      </div>
    </footer>
  );
}
