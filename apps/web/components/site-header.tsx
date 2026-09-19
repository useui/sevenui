"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDrawer } from "./drawer-context";
import { Logomark } from "./logomark";
import { currentTabForRoute, getSiteTabs } from "../lib/site-tabs";
import { site } from "../lib/site";
import { ThemeToggle } from "./theme-toggle";

// Every item in the header cluster is intrinsically sized, so leaving them
// shrinkable only squashes the icon buttons into ovals and wraps the tab
// labels inside the 4rem row. Ported verbatim from
// legacy-components/blume/Header.astro:131-132; shared with
// `components/theme-toggle.tsx`, which keeps its own copy since it has no
// header module to import it from.
const iconButton =
  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/**
 * The one persistent site header, one client component because
 * `aria-current` on the tab bar needs `usePathname()`: App Router does not
 * re-render a shared layout when navigating between its children, so the
 * active tab cannot be server-computed the way Blume computed it per-request
 * from `Astro.props.route`. A server header hosting client islands for the
 * handful of interactive pieces would buy nothing when the whole serialized
 * payload is five tabs.
 *
 * Ported from `legacy-components/blume/Header.astro`, stripped to what's
 * actually configured: no `Ask` (no `ai.ask`), no `LanguageSwitcher` /
 * locale switch (no locales), no `NavSelector` / version selector (none
 * configured), no banner. Two slots stay deliberately empty for now — the
 * search trigger (Stage 7, §9.5) and the auth pill (Stage 6, §12) — each
 * later stage adds its own element.
 *
 * The logo and the tab bar use `next/link`, not a plain `<a>`: App Router
 * owns soft navigation now that Astro's `<ClientRouter>` is gone (spec
 * §11.1), and this header persists across route changes, so a plain `<a>`
 * here would trade the live site's soft navigation for a full reload on
 * every internal click. Only the external GitHub link stays a plain `<a>`.
 *
 * `primitivesHref` comes from `app/layout.tsx`: the Primitives tab's link
 * target is the nav's first primitive child, and the nav tree is read
 * through `lib/docs`, which is `server-only` — this client component can't
 * import it itself, so the root layout resolves it once and passes it down
 * (`lib/site-tabs.ts`'s `getSiteTabs` doc comment has the full reasoning).
 */
export function SiteHeader({ primitivesHref }: { primitivesHref: string }) {
  const pathname = usePathname();
  const tabs = getSiteTabs(primitivesHref);
  const activeTabHref = currentTabForRoute(pathname, tabs);
  const { setOpen } = useDrawer();
  const repoUrl = `https://github.com/${site.github.owner}/${site.github.repo}`;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-6">
      <button
        aria-label="Toggle navigation"
        className={`${iconButton} lg:hidden`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu aria-hidden="true" size={20} />
      </button>
      {/*
        The logo is the one deliberate exception to `shrink-0` in this
        header: it carries `min-w-0`/`truncate` instead, so it absorbs any
        row deficit by itself (Header.astro:127-130). Classes ported from
        Blume's default `Logo.astro` slot's anchor and wordmark span.
      */}
      <Link
        className="inline-flex min-w-0 items-center gap-2 font-semibold text-base text-foreground"
        href="/"
      >
        <Logomark className="h-5 w-auto shrink-0" />
        <span className="truncate">{site.name}</span>
      </Link>
      {/*
        Inline tabs wait until `lg` on every page, not `md` for docs the way
        Blume's `tabsNavClass` did (Header.astro:119-125). The recorded
        reason still holds: a hamburger plus a 294px tab bar in the same
        768px row overflowed as soon as anything else in it widened.
      */}
      <nav aria-label="Sections" className="hidden gap-1 lg:flex">
        {tabs.map((tab) => (
          <Link
            aria-current={tab.href === activeTabHref ? "page" : undefined}
            className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:text-foreground"
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1" />
      {/* Search trigger goes here — Stage 7, §9.5. */}
      <div className="flex shrink-0 items-center gap-2">
        <a
          aria-label="GitHub repository"
          className={iconButton}
          href={repoUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubMark />
        </a>
        <ThemeToggle />
        {/* Auth pill goes here — Stage 6, §12. */}
      </div>
    </header>
  );
}

// The official GitHub mark on a 16×16 viewBox, ported from Blume's own
// `GITHUB_MARK` path data (blume/components/github-mark.ts) rather than a
// `lucide-react` icon: this project's `lucide-react` (1.41.0) ships no brand
// icons at all (verified against its full export list) — the library
// dropped Simple Icons upstream — so a "GitHub" icon does not exist there to
// consume. Substituting a generic glyph would be an unlisted visual
// regression under this migration's rule that every difference from the old
// site must be a named, intended one; inlining the same path data keeps the
// mark byte-identical instead.
function GithubMark() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 16 16" width="18" xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
        fillRule="evenodd"
      />
    </svg>
  );
}
