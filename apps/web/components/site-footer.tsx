"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logomark } from "./logomark";

const footerPrimitives = ["button", "input", "select", "combobox", "checkbox", "switch", "slider", "table"];

export function SiteFooter({ primitivesHref }: { primitivesHref: string }) {
  const framed = usePathname() === "/";

  const columns = (
    <>
      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center gap-2 font-semibold">
          <Logomark className="h-5 w-auto" /> SevenUI
        </span>
        <p className="max-w-xs text-sm text-muted-foreground">
          Base UI powered primitives, distributed through the shadcn registry.
        </p>
      </div>
      <nav aria-label="Primitives" className="flex flex-col gap-2 text-sm">
        <span className="mb-1 font-medium">Primitives</span>
        {footerPrimitives.map((name) => (
          <Link className="text-muted-foreground transition-colors hover:text-foreground" href={`/docs/components/${name}`} key={name}>
            {name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ")}
          </Link>
        ))}
        <Link className="text-muted-foreground transition-colors hover:text-foreground" href={primitivesHref}>
          All primitives →
        </Link>
      </nav>
      <nav aria-label="Resources" className="flex flex-col gap-2 text-sm">
        <span className="mb-1 font-medium">Resources</span>
        <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/docs">
          Documentation
        </Link>
        <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/docs/installation">
          Installation
        </Link>
        <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/docs/theming">
          Theming
        </Link>
        <a className="text-muted-foreground transition-colors hover:text-foreground" href="https://github.com/useui/sevenui" rel="noopener noreferrer" target="_blank">
          GitHub
        </a>
      </nav>
      <nav aria-label="Built with" className="flex flex-col gap-2 text-sm">
        <span className="mb-1 font-medium">Built on</span>
        <a className="text-muted-foreground transition-colors hover:text-foreground" href="https://base-ui.com" rel="noopener noreferrer" target="_blank">
          Base UI
        </a>
        <a className="text-muted-foreground transition-colors hover:text-foreground" href="https://ui.shadcn.com/docs/registry" rel="noopener noreferrer" target="_blank">
          shadcn registry
        </a>
        <a className="text-muted-foreground transition-colors hover:text-foreground" href="https://tailwindcss.com" rel="noopener noreferrer" target="_blank">
          Tailwind CSS
        </a>
      </nav>
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
      </nav>
    </>
  );

  if (framed) {
    return (
      <footer>
        <div className="l-row l-marks">
          <div className="grid w-full gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">{columns}</div>
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
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">{columns}</div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          {legal}
        </div>
      </div>
    </footer>
  );
}
