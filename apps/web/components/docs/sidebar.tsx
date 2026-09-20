"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavGroup, NavNode } from "../../lib/docs/nav";
import { currentTabForRoute, getSiteTabs } from "../../lib/site-tabs";
import { useDrawer } from "../drawer-context";

/**
 * The docs sidebar (§5). One element that is both the desktop column and
 * the mobile drawer, ported from `legacy-components/blume/NavTree.astro`
 * (the SevenUI override that actually renders on sevenui.dev — the Blume
 * package's own `NavTree.astro` is 71 lines different and loses two real
 * features) inside `blume/components/layout/RootLayout.astro:556-740`'s
 * `<aside data-blume-nav-drawer>`.
 *
 * `"use client"` for one reason: `aria-current="page"` needs
 * `usePathname()`. App Router does not re-render a shared layout when
 * navigating between its children, so the active row cannot be
 * server-computed the way Astro computed it per request from
 * `Astro.props.route`. The TREE itself is still built on the server —
 * `app/docs/layout.tsx` calls `getNavTree()` and hands the result down as
 * plain serialized data, so `fs` and the content index never reach the
 * client (`lib/docs/nav.ts` is `import "server-only"`; only its TYPES are
 * imported here, and `import type` is erased before any bundler sees it).
 *
 * Blume's `page`-mode panel machinery is NOT ported: the drill-in buttons,
 * the back button, the `blume-nav` custom element and its 260 ms slide are
 * built only for `display: "page"` groups, and SevenUI declares exactly one
 * group with `display: "group"`, so the whole mechanism is unreachable on
 * this site (§14.7). Nor is `collapsed: false`, also unused. `rtl:` variants
 * are dropped throughout (§11.6 — no locale, no `dir` switch, i18n ruled out
 * map-wide); the logical properties (`start-0`, `border-e`) stay, because
 * those are unconditional and simply correct.
 */
export function DocsSidebar({ primitivesHref, tree }: { primitivesHref: string; tree: NavNode[] }) {
  const { open, setOpen } = useDrawer();
  const pathname = usePathname();
  const tabs = getSiteTabs(primitivesHref);
  const activeTabHref = currentTabForRoute(pathname, tabs);

  // Two refs, not one, and not the `data-blume-nav-tree` attribute the
  // original used as its query hook (§13.3 retires every `data-blume-*`
  // name): `asideRef` is the SCROLL CONTAINER `center()` measures and
  // scrolls, `treeRef` is the SCOPE it searches for the active link.
  //
  // They have to be different elements. Blume's own script scoped its
  // lookup to `[data-blume-nav-tree]` precisely "because the drawer also
  // holds the mobile tabs list, whose active tab is `aria-current` too"
  // (head-scripts.ts:80-83) — but SevenUI's NavTree override renders that
  // tabs block INSIDE `data-blume-nav-tree` (verified in the shipped HTML:
  // `<nav data-blume-nav-tree><div class="mb-4 … lg:hidden"><nav
  // aria-label="Sections">`), so live, below `lg`, the scoping does not
  // actually exclude it and `center()` finds the active TAB first. Putting
  // the scope ref on the tree's own `<ul>` restores the intent the comment
  // states. It changes nothing at `lg`+ (the tabs block is `lg:hidden`, so
  // `getClientRects()` already skipped it there).
  const asideRef = useRef<HTMLElement>(null);
  const treeRef = useRef<HTMLUListElement>(null);

  // `true` on the server and for the first client render, which is what
  // makes the markup match Blume's: its `syncDrawerInert()` ran client-side
  // only, so the shipped HTML carries no `inert` either. Starting at
  // `false` instead would ship `inert` on a desktop sidebar and then remove
  // it, which is the wrong way round.
  const [desktop, setDesktop] = useState(true);

  // A tick bumped whenever a group forces itself open. See `center()`
  // below — this is the dependency that makes it fire AFTER the group has
  // actually expanded.
  const [revealTick, setRevealTick] = useState(0);
  const onReveal = useCallback(() => setRevealTick((n) => n + 1), []);

  // Forced by React, not a stylistic choice, and the same handler
  // `site-drawer.tsx` carries for the same reason: Astro needed none
  // because every navigation was a document load, which reset
  // `data-blume-nav-open` for free. This layout persists across client-side
  // navigations, so without this the drawer would stay open over the page
  // it just navigated to.
  const closeDrawer = useCallback(() => setOpen(false), [setOpen]);

  // `matchMedia` at `lg` (64rem) does double duty here. Blume split the
  // same query across two places: `Header.astro:150`'s `resize` listener
  // (leaving `lg`+ must not leave the drawer open behind it) and
  // `drawer-inert.ts`'s `desktop.matches` guard (the same element is the
  // static sidebar from `lg` up, so it must never be `inert` there —
  // `site-drawer.tsx` needs no such guard because it is `lg:hidden`).
  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    setDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setDesktop(event.matches);
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [setOpen]);

  // Scroll lock while open, ported from Header.astro:150's
  // `d.style.overflow=open?"hidden":""`.
  //
  // This, the backdrop button below, and the `inert` handling are
  // DUPLICATED from `site-drawer.tsx` rather than shared, because §A4's
  // ruling makes `SiteDrawer` return `null` under `/docs` — so on docs
  // routes nothing else owns them. Lifting all three into
  // `DrawerProvider` is the obvious de-duplication and is a deliberate
  // non-goal of this task: `drawer-context.tsx` is outside its file list.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // `center()` — ported from Blume's `SIDEBAR_SCROLL_INIT_SCRIPT`
  // (`blume/components/layout/head-scripts.ts:87`), which nothing in the
  // plan or the spec mentions. §17.6 #6 credits layout persistence with
  // making "sidebar scroll position persist"; that script already did it,
  // and it did TWO things. The save/restore half (`astro:before-swap` /
  // `astro:after-swap` around `scrollTop`) is genuinely free here — the
  // element is never unmounted — so #6 is a mechanism change with no
  // observable difference, not a new behaviour. This half is not free and
  // is not optional: with 65 primitives in a scrolling column, arriving
  // from the search palette, pagination or a prose link at a page whose
  // sidebar link is below the fold means the highlighted row is simply
  // never seen. §17.2's extractor reads route, text, headings and links —
  // it is blind to scroll position, so losing this produces no diff on any
  // gate.
  //
  // Semantics kept exactly: the FIRST `a[aria-current="page"]` that has
  // `getClientRects().length` (so a link inside a collapsed group is
  // skipped, which is why this interacts with the one-way force below); a
  // no-op when that link already sits fully inside the aside's box; and
  // otherwise the original's arithmetic verbatim.
  //
  // `revealTick`, not `pathname` alone, and the brief's "keyed on the
  // active pathname" is not sufficient on its own — React effect ordering
  // defeats it. Child effects run before parent effects, so on a
  // client-side navigation INTO a collapsed group, `NavGroupRow`'s force
  // (below) has only *scheduled* a re-render by the time this effect runs:
  // the `<details>` is still closed in the DOM, the active link still has
  // no client rects, and this would no-op forever because `pathname` never
  // changes again. `onReveal` bumps the tick in the same batch as
  // `setOpen(true)`, so this re-runs once the group is actually expanded.
  // The extra pass when the group was ALREADY open is harmless: the link
  // is visible, so the first branch returns early.
  useEffect(() => {
    const box = asideRef.current;
    const scope = treeRef.current;
    if (!box || !scope) return;
    let link: HTMLElement | null = null;
    for (const anchor of scope.querySelectorAll<HTMLElement>('a[aria-current="page"]')) {
      if (anchor.getClientRects().length) {
        link = anchor;
        break;
      }
    }
    if (!link) return;
    const boxRect = box.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    if (linkRect.top >= boxRect.top && linkRect.bottom <= boxRect.bottom) return;
    box.scrollTop += linkRect.top - boxRect.top - (box.clientHeight - linkRect.height) / 2;
  }, [pathname, revealTick]);

  return (
    <>
      {/*
        Three substitutions against the live class list, all settled before
        this task:

        `--blume-drawer-top` is gone in favour of a static `top-16` /
        `h-[calc(100dvh-4rem)]` — the variable existed only because a
        banner's wrapping text made the header's bottom edge a non-constant,
        measured on open, banner dismiss and resize (Header.astro:143-150).
        No banner is configured, so the header's height is the constant
        `h-16`. `site-drawer.tsx` already made exactly this substitution.
        With the base value static, Blume's two `lg:`-scoped `top` and `height`
        utilities become literal duplicates of it and are dropped with it
        (paraphrased rather than quoted, for the scan reason below).

        The CSS-attribute open mechanism becomes React state. Blume drove it
        from an arbitrary `:where(...)` descendant variant reading a
        nav-open attribute on `<html>`, cancelling the off-canvas
        translation; the variant is not quoted verbatim anywhere in this
        file on purpose, because Tailwind's `@source` scan is a plain text
        scan and lifts a bracket variant out of a COMMENT into the shipped
        sheet — two dead rules, verified in `.next/static/chunks/*.css` on
        the first build of this file. That is the same §17.6 #5 leak
        `globals.css`'s `@source not "../legacy-components"` exclusion
        exists to stop. `lg:translate-x-0!` is kept verbatim, `!` included: from `lg`
        up this element is the static column and must never be translated,
        whichever way the mobile state happens to be pointing.

        Blume's `lg:`-scoped border-cancel utility is DROPPED, which
        reinstates the desktop divider. Blume sets `border-e` for the drawer
        and then cancels it at `lg`; the NavTree override added it back
        through a DOUBLED attribute selector in a `<style is:global>` block,
        because Tailwind v4 emits these utilities unlayered and a single
        attribute selector only ties with the cancel on specificity. We own
        this element, so the fix is to not cancel the border in the first
        place — one declaration, no specificity race, and no chance of the
        doubling trick losing one. The border below `lg` is the drawer's own
        edge, as before; there is only ever one declaration, so nothing
        doubles up. The cancel utility is named in prose and not quoted for
        the same scan reason: quoting it emitted a live rule for it into the
        sheet, which would make this comment's own claim unverifiable by
        reading the CSS.
      */}
      <aside
        aria-label="Primary"
        className={`fixed top-16 start-0 z-[35] h-[calc(100dvh-4rem)] w-64 max-w-[80vw] overflow-y-auto border-border border-e bg-background px-5 pt-4 pb-6 transition-transform lg:sticky lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0! lg:scrollbar-thin lg:scrollbar-thumb-border lg:scrollbar-track-transparent lg:bg-transparent lg:px-4 ${
          open ? "translate-x-0" : "-translate-x-[105%]"
        }`}
        inert={!desktop && !open}
        ref={asideRef}
      >
        {/*
          The site tabs, inside the drawer, `lg:hidden`. NavTree.astro:121-140
          renders this as the tree's first child and its comment gives the
          reason: `blume.config` declares no `navigation.tabs`, so
          RootLayout's own tab list (`:617-660`) never populates, and the
          header injects `SITE_TABS` where the layout cannot see them.
          Without this block the mobile docs drawer was the page tree and
          nothing else — no way to reach Blocks or Pro without scrolling
          past every primitive. Same source (`getSiteTabs`), same classes
          and same `aria-current` treatment as `site-drawer.tsx`, so the
          drawer reads identically across the site.
        */}
        <div className="mb-4 border-border border-b pb-4 lg:hidden">
          <nav aria-label="Sections">
            <ul className="m-0 list-none p-0">
              {tabs.map((tab) => (
                <li key={tab.href}>
                  <Link
                    aria-current={tab.href === activeTabHref ? "page" : undefined}
                    className="block rounded-[0.65rem] px-2.5 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                    href={tab.href}
                    onClick={closeDrawer}
                  >
                    {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/*
          Blume wrapped the tree in `<nav data-blume-nav-tree>`. The element
          existed only to be that script's query hook, and it is dropped
          with the attribute (§13.3): `treeRef` addresses the tree directly,
          and an unlabelled `<nav>` nested inside a labelled `<nav>` inside
          `<aside aria-label="Primary">` is landmark noise a screen reader
          announces with no name. §17.2's extractor reads text, headings and
          links, so removing a wrapper element costs nothing at the gate.
        */}
        <NavList
          items={tree}
          listRef={treeRef}
          onNavigate={closeDrawer}
          onReveal={onReveal}
          pathname={pathname}
        />
      </aside>
      {/*
        The backdrop, ported from RootLayout.astro:745-751's nav-toggle
        button, whose `hidden` plus nav-open attribute variant (not quoted
        here — see the aside's class comment above for why) becomes a
        conditional render, as in `site-drawer.tsx`. It has to be
        here as well as there: `SiteDrawer` is `null` under `/docs` (§A4),
        so on docs routes this is the only outside-click close affordance.
      */}
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-[30] cursor-pointer border-0 bg-black/40 lg:hidden"
          onClick={closeDrawer}
          type="button"
        />
      )}
    </>
  );
}

// Re-derived rather than imported from `lib/docs/nav.ts`, which exports the
// same predicate as `isNavGroup` and is the single discriminator every
// server-side consumer shares. That module is `import "server-only"`, so a
// `"use client"` file importing the VALUE fails the build (only its types
// cross, above). One line, and the shape it tests is the same structural
// fact `buildNavTree` used to build the tree.
function isGroup(node: NavNode): node is NavGroup {
  return "children" in node;
}

// A group is "active inside" when the current route is the group's own page
// (Task 3.3 populates that `href`) or any descendant's. Recursive even
// though today's `children` is `NavLink[]`, for the same reason
// `lib/docs/nav.ts`'s own walkers are.
function containsRoute(node: NavNode, route: string): boolean {
  if (!isGroup(node)) return node.href === route;
  return node.href === route || node.children.some((child) => containsRoute(child, route));
}

type RowProps = {
  onNavigate: () => void;
  onReveal: () => void;
  pathname: string;
};

/**
 * One `<ul>` per level (NavTree.astro:205-226 for the leaf rows). Two row
 * types and no others, per §5: a page link and one `group` collapsible.
 */
function NavList({
  items,
  listRef,
  onNavigate,
  onReveal,
  pathname,
}: RowProps & { items: NavNode[]; listRef?: React.Ref<HTMLUListElement> }) {
  return (
    <ul className="m-0 list-none space-y-px p-0" ref={listRef}>
      {items.map((item, index) =>
        isGroup(item) ? (
          <NavGroupRow
            group={item}
            key={item.label}
            onNavigate={onNavigate}
            onReveal={onReveal}
            pathname={pathname}
            // NavTree.astro:236-239's `spacing`, reduced to the two cases
            // that can occur: `flat` groups — whose own branch there is wider
            // section-header spacing — are not a row type here (§5).
            spacing={index === 0 ? "mt-0" : "mt-0.5"}
          />
        ) : (
          <li key={item.href}>
            <Link
              aria-current={item.href === pathname ? "page" : undefined}
              className="block rounded-[0.65rem] px-2.5 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
              href={item.href}
              onClick={onNavigate}
            >
              {/*
                The inner `<span class="flex items-center gap-2">` is kept
                even though it wraps a single child today: it is the row's
                icon/badge/deprecated-marker slot
                (NavTree.astro:215-228), and no node in this corpus carries
                any of the three — verified against the shipped HTML, where
                every sidebar row is exactly this two-span shape. Dropping
                the flex row would make adding one later a layout change
                rather than an insertion.
              */}
              <span className="flex items-center gap-2">
                <span className="flex-1 truncate">{item.label}</span>
              </span>
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

/**
 * A `group` collapsible (NavTree.astro:276-322). A real `<details>`, not a
 * div pair: the chevron rule is `[details[open]>summary_&]:rotate-90` and
 * it depends on the actual element.
 *
 * Open state is CONTROLLED, and the force is one-way. Blume's
 * `<details open={active}>` was server-computed with zero persistence, but
 * that is an artifact of every navigation being a document load: in a
 * persistent layout an uncontrolled `defaultOpen` is ignored after mount,
 * so a reader jumping from `/docs/theming` to `/docs/components/button` via
 * the search palette would find the group CLOSED — a real regression. This
 * reproduces today's observable behaviour and additionally lets a
 * manually-opened group survive navigation. No `localStorage`: there is
 * none today and it would crowd §8's single-key contract.
 */
function NavGroupRow({
  group,
  onNavigate,
  onReveal,
  pathname,
  spacing,
}: RowProps & { group: NavGroup; spacing: string }) {
  const activeInside = containsRoute(group, pathname);
  const [open, setOpen] = useState(activeInside);

  useEffect(() => {
    if (activeInside) {
      setOpen(true); // forces open; NEVER forces closed
      // Tells the sidebar to re-run `center()` once this expansion has
      // actually committed — see its effect for why `pathname` alone
      // cannot see it.
      onReveal();
    }
  }, [activeInside, onReveal]);

  return (
    <li className={spacing}>
      <details
        onToggle={(event) => setOpen(event.currentTarget.open)}
        open={open}
      >
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-[0.65rem] px-2.5 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
          {/*
            A `<span>`, because SevenUI's group has no `href` yet.
            NavTree.astro:279-298 has an `<a>` branch for a group that
            carries a `route` — Task 3.3 is the one that populates
            `NavGroup.href` (from the content index's `route`, never from
            the label) and turns that branch on here, making the summary a
            link with the toggle bound to the chevron. The shape is left
            addressable for it rather than collapsed away.
          */}
          <span className="flex-1 truncate">{group.label}</span>
          {/*
            Scoped to this group's own `details` rather than Tailwind's
            `group-open` variant, which matches any open ancestor `.group`
            and rotated nested chevrons while their own group stayed closed
            (NavTree.astro:314-317).
          */}
          <span className="shrink-0 text-muted-foreground transition-transform [details[open]>summary_&]:rotate-90">
            <ChevronRight aria-hidden="true" size={13} />
          </span>
        </summary>
        <div className="space-y-0.5 border-border border-l pl-3">
          <NavList
            items={group.children}
            onNavigate={onNavigate}
            onReveal={onReveal}
            pathname={pathname}
          />
        </div>
      </details>
    </li>
  );
}
