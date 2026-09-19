// Plain site footer, ported verbatim from `legacy-components/site-footer.astro`
// (markup, link targets, and copy unchanged; `class` -> `className`). No
// interactivity, so this stays a server component — `next/link` needs no
// client boundary.
//
// Rendered as a `<footer>` rather than the source's bare `<div>`
// (site-footer.astro:25): on the live site every one of its 18 callers wraps
// this markup in `<footer slot="footer">`, so the `contentinfo` landmark was
// never this component's own job there. `SiteFooter` is now the whole
// footer, not an Astro fragment a caller wraps, so the landmark has to move
// inside it or every page loses it silently.
//
// Its four external anchors (GitHub, Base UI, the shadcn registry, Tailwind
// CSS) carry `target="_blank" rel="noopener noreferrer"` literally in JSX:
// the Astro build's post-build regex pass that used to add this to every
// external anchor (blume.config.ts's `sevenui-external-links` integration)
// has no equivalent in a Next.js build. Its internal links use `next/link`
// so navigation stays a soft, client-side transition instead of a full
// document reload — the whole reason App Router replaces Astro's
// `<ClientRouter>` (spec §11.1).
import Link from "next/link";
import { Logomark } from "./logomark";

const footerPrimitives = ["button", "input", "select", "combobox", "checkbox", "switch", "slider", "table"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
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
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href={`/docs/components/${name}`}
              key={name}
            >
              {name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ")}
            </Link>
          ))}
          <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/docs/components/accordion">
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
          <a
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="https://github.com/useui/sevenui"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </nav>
        <nav aria-label="Built with" className="flex flex-col gap-2 text-sm">
          <span className="mb-1 font-medium">Built on</span>
          <a
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="https://base-ui.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Base UI
          </a>
          <a
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="https://ui.shadcn.com/docs/registry"
            rel="noopener noreferrer"
            target="_blank"
          >
            shadcn registry
          </a>
          <a
            className="text-muted-foreground transition-colors hover:text-foreground"
            href="https://tailwindcss.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Tailwind CSS
          </a>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>MIT License © 2026 SevenUI</p>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link className="transition-colors hover:text-foreground" href="/terms">
              Terms
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
