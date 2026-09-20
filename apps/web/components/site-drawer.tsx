"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { currentTabForRoute, getSiteTabs } from "../lib/site-tabs";
import { useDrawer } from "./drawer-context";

/**
 * The mobile nav drawer: one per site, listing `SITE_TABS`, opened by the
 * header's hamburger button. Ported from `legacy-components/site-drawer.astro`
 * and `legacy-components/site-drawer-tabs.astro` (the drawer's only tree —
 * this app has no docs sidebar yet, so the `hasTree`/`<slot />` branching
 * that made room for one in the Astro source has nothing to render and is
 * dropped).
 *
 * Returns `null` under `/docs` — see the guard in the body; that docstring
 * line above ("this app has no docs sidebar yet") stopped being true in
 * Task 3.1, which brought the tree branch back as its own component.
 *
 * Deliberately hand-rolled rather than the registry's `Sheet`: Sheet is
 * modal with a focus trap, and this drawer is non-modal by design — a choice
 * recorded twice in the Astro source (site-drawer.astro:11-30's comment and
 * Header.astro:143-149's). Closing the tab strip via the header's
 * hamburger, an outside click on the backdrop, or a tab link itself is the
 * whole interaction; nothing traps focus inside it.
 *
 * `--blume-drawer-top` is gone in favour of a static `top-16`: it existed
 * only because a banner's wrapping text made the header's bottom edge a
 * non-constant, measured via `getBoundingClientRect()` on open, banner
 * dismiss, and resize (Header.astro:143-150). No banner is configured, so
 * the header's height is the constant `h-16` (4rem) and the whole
 * measurement, plus its two re-measure triggers, is deleted rather than
 * ported.
 *
 * `primitivesHref` is threaded down from `app/layout.tsx` for the same
 * reason `SiteHeader` takes it: the nav tree lives behind `lib/docs`
 * (`server-only`), and this is a `"use client"` component.
 */
export function SiteDrawer({ primitivesHref }: { primitivesHref: string }) {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const tabs = getSiteTabs(primitivesHref);
  const activeTabHref = currentTabForRoute(pathname, tabs);

  // Task 3.1 (§5): a docs page must carry exactly ONE drawer, and under
  // `/docs` that drawer is `components/docs/sidebar.tsx` — the same element
  // that is the desktop sidebar column, which additionally lists the 65
  // primitives this tabs-only drawer never could. It owns the backdrop, the
  // scroll lock, the `inert` handling and the tab block there, so this
  // component stands down entirely rather than stacking a second off-canvas
  // panel behind it.
  //
  // The rejected alternative was feeding the tree upward into this drawer:
  // a child layout cannot hand data to a parent layout during SSR, so
  // `app/layout.tsx` would have to serialize all 65 links into the client
  // payload on EVERY route (`/`, `/blocks`, `/pro`, the gallery) when Blume
  // pays for them on docs pages only.
  //
  // `usePathname()` resolves during prerender, so the suppression is
  // server-side too — the static HTML for a docs route simply has no second
  // drawer in it, not a hydration-time flip. The check has to sit below
  // every hook, and the two effects below opt out of it by the same flag,
  // so nothing here contends with the docs sidebar for `documentElement`'s
  // `overflow` or for the drawer's open state.
  const isDocs = pathname === "/docs" || pathname.startsWith("/docs/");

  // Close-on-resize past `lg` (64rem), ported from Header.astro:150's
  // `resize` listener as a `matchMedia` listener instead — the intent
  // (leaving `lg`+ never leaves the scroll lock or the drawer open behind
  // it) is unchanged, only the event source is.
  useEffect(() => {
    if (isDocs) return;
    const query = window.matchMedia("(min-width: 64rem)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [isDocs, setOpen]);

  // Scroll lock while open, ported verbatim from Header.astro:150's
  // `d.style.overflow=open?"hidden":""`.
  useEffect(() => {
    if (isDocs) return;
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isDocs, open]);

  if (isDocs) return null;

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
        <nav aria-label="Sections">
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
                  onClick={() => setOpen(false)}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
