"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, type ReactNode } from "react";
import { currentTabForRoute, getSiteTabs } from "../lib/site-tabs";
import { useDrawer } from "./drawer-context";

/**
 * The mobile nav drawer's machinery, extracted verbatim from
 * `components/site-drawer.tsx` so a second section can mount one without the
 * backdrop, the scroll lock, the `inert` handling and the close-on-resize
 * becoming a third copy of themselves. Everything here — the panel, the
 * `SITE_TABS` strip, the rule between the tab block and an optional tree, the
 * backdrop — was `SiteDrawer`'s body before this extraction and is unchanged
 * by it; the comments that travelled with each piece are its history.
 *
 * `SiteDrawer` still decides WHETHER a drawer exists on a given route and
 * which tree goes in it; that is a routing judgement and it stays there.
 * `components/blocks/blocks-drawer.tsx` is the second caller, mounted from
 * `/blocks`'s own layout because the root layout cannot read the pro manifest
 * without handing every route on the site its revalidation window — the
 * reason is written out in `site-drawer.tsx`'s own guard.
 *
 * `tree` is what used to be Astro's `<slot />`: a page handing its own
 * navigation in to sit under the tab block. The separating rule is present
 * exactly when `tree` is, which is what keeps this invisible on the routes
 * that pass nothing.
 *
 * Deliberately hand-rolled rather than the registry's `Sheet`: Sheet is modal
 * with a focus trap, and this drawer is non-modal by design — a choice
 * recorded twice in the Astro source (site-drawer.astro:11-30's comment and
 * Header.astro:143-149's). Closing the tab strip via the header's hamburger,
 * an outside click on the backdrop, or a tab link itself is the whole
 * interaction; nothing traps focus inside it.
 *
 * The static `top-16` below replaced `--blume-drawer-top`, which existed only
 * because a banner's wrapping text made the header's bottom edge a
 * non-constant, measured via `getBoundingClientRect()` on open, banner
 * dismiss, and resize (Header.astro:143-150). No banner is configured, so the
 * header's height is the constant `h-16` (4rem) and the whole measurement,
 * plus its two re-measure triggers, is deleted rather than ported.
 *
 * `primitivesHref` is threaded down from a Server Component for the same
 * reason `SiteHeader` takes it: the nav tree lives behind `lib/docs`
 * (`server-only`), and this is a `"use client"` component.
 */
export function DrawerShell({ primitivesHref, tree }: { primitivesHref: string; tree?: ReactNode }) {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const tabs = getSiteTabs(primitivesHref);
  const activeTabHref = currentTabForRoute(pathname, tabs);

  const closeDrawer = useCallback(() => setOpen(false), [setOpen]);

  // Close-on-resize past `lg` (64rem), ported from Header.astro:150's
  // `resize` listener as a `matchMedia` listener instead — the intent
  // (leaving `lg`+ never leaves the scroll lock or the drawer open behind
  // it) is unchanged, only the event source is.
  //
  // The `isDocs` bail-out these two effects used to carry is gone, not
  // dropped: it existed so a docs route could run `SiteDrawer`'s hooks
  // unconditionally and still not contend with the docs sidebar for
  // `documentElement`'s `overflow`. The guard now lives one level up, where
  // `SiteDrawer` returns `null` before this component is ever rendered, so
  // these effects simply do not exist on those routes.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [setOpen]);

  // Scroll lock while open, ported verbatim from Header.astro:150's
  // `d.style.overflow=open?"hidden":""`.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/*
        Ported from site-drawer.astro:36-45. `inert` replaces
        `syncDrawerInert()`'s attribute-driven `MutationObserver`
        (blume/components/layout/drawer-inert.ts) with a direct read of
        React state: the drawer stays out of the tab order and the
        accessibility tree while closed, exactly as the original did below
        `lg` — above `lg` the drawer is already `display:none` via
        `lg:hidden`, so `inert`'s value stops mattering there too, the same
        as the original's `desktop.matches` check.
      */}
      <aside
        aria-label="Navigation"
        className={`fixed top-16 start-0 z-[35] h-[calc(100dvh-4rem)] w-64 max-w-[80vw] overflow-y-auto border-border border-e bg-background px-5 pt-4 pb-6 transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-[105%] rtl:translate-x-[105%]"
        }`}
        inert={!open}
      >
        {/*
          The rule between the tab block and the tree, ported from
          `site-drawer.astro`'s `hasTree` class list. It sits on the `<nav>`
          itself rather than on a wrapper `<div>` as the Astro source had
          it: that `<div>` carried nothing else, and a block-level `<nav>`
          draws the same box. Undefined (no `class` attribute at all) on
          every route that passes no tree, which is what keeps this change
          invisible outside the sections that do.
        */}
        <nav aria-label="Sections" className={tree ? "mb-4 border-border border-b pb-4" : undefined}>
          <ul className="m-0 list-none p-0">
            {tabs.map((tab) => (
              <li key={tab.href}>
                <Link
                  aria-current={tab.href === activeTabHref ? "page" : undefined}
                  className="block rounded-[0.65rem] px-2.5 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                  href={tab.href}
                  // Forced by React, not a stylistic choice: Astro's version
                  // needed no such handler because every navigation was a
                  // full page load, which reset `data-blume-nav-open` for
                  // free. This header/drawer pair persists across client-side
                  // navigations (that's the whole reason `aria-current` needs
                  // `usePathname()` above), so without this the drawer would
                  // stay open over the page it just navigated to.
                  onClick={closeDrawer}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {tree}
      </aside>
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-[30] cursor-pointer border-0 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          type="button"
        />
      )}
    </>
  );
}
