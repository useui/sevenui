import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { Analytics } from "../components/analytics";
import { DrawerProvider } from "../components/drawer-context";
import { PackageManagerScript } from "../components/package-manager-script";
import { SiteDrawer } from "../components/site-drawer";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { ThemeProvider } from "../components/theme-provider";
import { site } from "../lib/site";

// §11.2: nobody owned this resolved config today — it's Blume's *defaults*,
// not anything written in `blume.config.ts` — Inter for body and display,
// IBM Plex Mono for mono. Geist is deliberately not used: it was deferred,
// not rejected. `/` and `/blocks` are held near pixel parity, and moving
// typography and framework in one deploy gives every drift the sampled
// review finds two suspects. Next's own preload handling stands in for
// Astro's per-weight preload list; reproducing that list is not parity work
// under §17's bar.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
  // The favicon/meta/OG/canonical block is Stage 8 and Stage 9's — this is
  // only the one icon reference Stage 1 needs, and `/icon.svg` exists under
  // `apps/web/public/`.
  icons: { icon: "/icon.svg" },
};

/**
 * The root layout (§11.1). Ten of Blume's fifteen shell pieces do not come
 * along, and none of them is a loss: `<ClientRouter>` and
 * `SWAP_STYLESHEET_INIT_SCRIPT` (App Router owns soft navigation; the
 * body-stylesheet race cannot occur), `<Banner>` and `BANNER_INIT_SCRIPT`
 * (dead code — no `banner` is configured, so the dismiss branch has never run
 * in production), the `blume-client-data` JSON island (emitted on docs pages;
 * nothing reads it), `syncDrawerInert()` (React renders `inert` from state),
 * `<Fonts>` (next/font above), `<WebMcp>` (§15.14 — no shipping browser
 * implements `navigator.modelContext`), and the favicon/meta/OG/canonical
 * block (Stage 8, Stage 9).
 *
 * `DrawerProvider` wraps `SiteHeader`, `main` and `SiteDrawer` (and, since
 * they're not adjacent siblings in a single JSX tree, `SiteFooter` too):
 * `SiteHeader`'s hamburger and `SiteDrawer` itself both call `useDrawer()`,
 * which throws outside a provider by design.
 *
 * `<SiteDrawer />` sits as a top-level sibling after `<main>` and before
 * `<SiteFooter>` — outside `<main>` entirely. That is a deliberate departure
 * from the legacy DOM, not a reproduction of it: `slot="footer"` is a named
 * Astro slot, so `PageLayout.astro:353-354` (`<main id="blume-content">
 * <slot /></main><slot name="footer" />`) actually renders the drawer's
 * default-slot content *inside* `<main>`, immediately before `</main>`, at
 * every one of its 18 legacy call sites — source order in each page's own
 * `.astro` file never controlled this, since slot content is hoisted to
 * where the layout places the named/default slots regardless of where it's
 * written in the caller. Moving the drawer to a `<main>` sibling here is
 * safe for three reasons: `inert` is applied to the drawer itself
 * (`site-drawer.tsx:73`), exactly as `drawer-inert.ts:12-27` did, so nothing
 * sibling-scoped depends on its position; it's `position: fixed`, so the move
 * has no visual effect; and the drawer was the last child of `<main>` and is
 * now the first element after it, so the linear text/link sequence is
 * unchanged.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${ibmPlexMono.variable}`} lang="en" suppressHydrationWarning>
      <head>
        <PackageManagerScript />
      </head>
      {/*
        Ported verbatim from `PageLayout.astro:332`
        (`class="bg-background font-sans text-foreground antialiased"`):
        nothing in the compiled sheet substitutes for this, so dropping it
        would leave the page canvas, default text colour and macOS font
        smoothing all unset site-wide.
      */}
      <body className="bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {/*
            The skip target is `#content`, not `#blume-content` (§13.3).
            `focus:text-accent-foreground` is ported from the legacy skip
            link's own class list (`PageLayout.astro:333-336`): once `<body>`
            supplies `text-foreground` again, the focused link needs its own
            text colour over `bg-accent`, or it inherits the wrong one.
          */}
          <a
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
            href="#content"
          >
            Skip to content
          </a>
          <DrawerProvider>
            <SiteHeader />
            <main id="content">{children}</main>
            <SiteDrawer />
            <SiteFooter />
          </DrawerProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
