"use client";

// The site footer, in its two live variants.
//
// Production has TWO footers with byte-identical content and different
// framing, and the port has to keep both or `/` regresses:
//
//   - `legacy-pages/index.astro:227-327` renders the landing's own footer
//     inside the exposed-grid canvas — each band wrapped in `.l-row`
//     (`.l-marks` on the link grid), the grid itself full-width, and NO top
//     border on the outer element, because the canvas's own section rules
//     already close the page.
//   - `legacy-components/site-footer.astro` is the plain footer every other
//     page renders: `border-t border-border` on the outer element and a
//     centred `max-w-6xl` column instead of the rails and crop marks. Its
//     own header comment says in as many words that it duplicates the
//     landing footer's link lists "without the landing's decorative
//     `.l-row`/`.l-marks` rail-and-crop-mark treatment", and leaves "a
//     shared extraction for both ... for a future landing refactor".
//
// This IS that extraction. The two variants were compared line by line
// before folding: same links, same hrefs, same link text, same `aria-label`s,
// same copy, same per-element classes, same order. The ONLY differences are
// the three wrapper class strings and the outer border — so the content
// below is written once and the variant supplies the frame.
//
// It is `"use client"` for one reason: which variant to draw depends on the
// route, and `<SiteFooter />` is mounted in the ROOT layout (app/layout.tsx),
// which App Router does not re-render on navigation and does not hand a
// pathname. `usePathname()` is the same mechanism `SiteHeader`, `SiteDrawer`
// and the docs sidebar already use for route-dependent chrome. The rejected
// alternatives: a route-group layout (the footer would land inside `<main>`),
// a `@footer` parallel route (a whole routing slot for one class swap), and a
// `body:has(…)` CSS switch (three wrapper class sets encoded in a selector no
// reader would find from here).
//
// Rendered as a `<footer>` rather than either source's bare `<div>`: on the
// live site the landing wraps its markup in `<footer slot="footer">` and
// every one of the plain footer's 18 callers does the same, so the
// `contentinfo` landmark was never either component's own job there.
// `SiteFooter` is now the whole footer, so the landmark has to move inside it
// or every page loses it silently.
//
// Its four external anchors (GitHub, Base UI, the shadcn registry, Tailwind
// CSS) carry `target="_blank" rel="noopener noreferrer"` literally in JSX:
// the Astro build's post-build regex pass that used to add this to every
// external anchor (blume.config.ts's `sevenui-external-links` integration)
// has no equivalent in a Next.js build. §4.6 counts those four and the
// landing's four separately (9 non-MDX anchors in all); folding the two
// footers together makes them the SAME four, so the site-wide total is 5
// (these four plus `/privacy`'s one, Task 4.3) and `/` carries exactly 4.
//
// Internal links use `next/link` so navigation stays a soft, client-side
// transition instead of a full document reload — the whole reason App Router
// replaces Astro's `<ClientRouter>` (spec §11.1).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logomark } from "./logomark";

const footerPrimitives = ["button", "input", "select", "combobox", "checkbox", "switch", "slider", "table"];

/**
 * `primitivesHref` comes from `app/layout.tsx`, which resolves it once with
 * `resolvePrimitivesHref(await getNavTree())` and already hands the same
 * string to `SiteHeader` and `SiteDrawer`. Before Task 4.1 the "All
 * primitives" link below hard-coded `/docs/components/accordion` — the nav
 * tree's first primitive, and therefore the right answer only by
 * coincidence. It resolves to that same route today, so the rendered `href`
 * does not change; what changes is that it can no longer drift from the two
 * other places on the page that link to "the primitives index".
 */
export function SiteFooter({ primitivesHref }: { primitivesHref: string }) {
  // The landing page is the only route drawn on the exposed-grid canvas
  // today; Task 4.3's legal pages use `.l-row` for their own content but
  // keep the plain footer, exactly as production does.
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
