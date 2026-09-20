import { DocsBreadcrumb } from "../../components/docs/breadcrumb";
import { DocsPageActions } from "../../components/docs/page-actions";
import { DocsSidebar } from "../../components/docs/sidebar";
import { DocsTocDesktop, DocsTocMobile, DocsTocProvider } from "../../components/docs/toc";
import { getDocIndex } from "../../lib/docs";
import type { Heading } from "../../lib/docs/headings";
import { type Crumb, docsTrail, getNavTree, resolvePrimitivesHref } from "../../lib/docs/nav";

/**
 * The persistent docs layout (§5, §11.1). Wraps all 69 docs routes (68 plus
 * `/docs/components`, which Task 3.3 added) so the sidebar is mounted once
 * and survives every navigation between them.
 *
 * A SERVER component, deliberately: it is the only place in this subtree
 * that can read `lib/docs/nav.ts` (`import "server-only"`). It builds the
 * tree here and hands it to `DocsSidebar` as plain serialized data, so
 * `fs` and the content index never reach the client bundle. The sidebar
 * itself is `"use client"` for exactly one reason — `aria-current="page"`
 * needs `usePathname()`, because App Router does not re-render a shared
 * layout when navigating between its children.
 *
 * `DrawerProvider` wraps `{children}` in `app/layout.tsx`, so the client
 * component below is inside the provider and `useDrawer()` resolves.
 *
 * DEPARTURE FROM THE TASK BRIEF, on the spec's authority. The brief's §A1
 * lists `<main>` as one of the three things this file builds, reproducing
 * `RootLayout.astro:685`'s `<main class="px-6 pt-6 pb-10 lg:px-8 xl:px-10"
 * id="blume-content">` as a grid child. It cannot: the LOCKED spec §11.1
 * gives `<main id="content">` to `app/layout.tsx` ("`app/layout.tsx` owns
 * the document: … skip link, `<main id="content">` … Nested layouts at
 * `app/docs`, `app/(gallery)/components` and `app/blocks` add their
 * sidebars"), Task 1.4 shipped exactly that, and the skip link points at
 * it. A second `<main>` here would be both a duplicate landmark and a
 * duplicate `id`. So the grid renders INSIDE the root `<main>`, and the
 * content column is a plain `<div>` carrying the padding `<main>` carried
 * in Blume. Visually identical — the root `<main>` is an unstyled block
 * wrapper. Two named consequences, neither of which §17's extractor can
 * see: the `<aside>` is now nested inside `<main>` rather than a sibling of
 * it, and `#content` (the skip-link target) now begins at the sidebar
 * instead of after it.
 */
export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const tree = await getNavTree();
  // Same resolution, same owner and the same fail-loud check as
  // `app/layout.tsx`: the drawer's tab block (`lg:hidden`) is the mobile
  // route to Blocks and Pro, and its Primitives entry links to the first
  // primitive. `getNavTree()` is memoized through `getDocIndex()`, so
  // resolving it again in this layout costs no second filesystem pass.
  const primitivesHref = resolvePrimitivesHref(tree);
  if (!primitivesHref) {
    throw new Error("app/docs/layout.tsx: nav tree has no Primitives group with a resolvable href");
  }

  // The TOC's heading data, for EVERY docs route rather than just this one —
  // see `components/docs/toc.tsx`'s header for why this layout cannot know
  // which route it is wrapping, and for the measured cost of the map. Same
  // memoized index the nav tree above came from, so no second filesystem pass.
  // The headings themselves are the content index's h2+h3 text scan (§4.5),
  // ids included; nothing here re-reads the MDX.
  //
  // The breadcrumb trails ride along in the same loop, for the same reason
  // and at the same cost (Task 3.3, §11.3). `DocsBreadcrumb` has to be a
  // client component — it sits HERE, above the mobile TOC, where no route is
  // available, so it reads `usePathname()` — but `docsTrail` lives in
  // `lib/docs/nav.ts`, which is `server-only`. Precomputing every route's
  // trail on the server and handing down a plain map keeps the nav tree and
  // the content index off the client, exactly as `headingsByRoute` does.
  const headingsByRoute: Record<string, Heading[]> = {};
  const crumbsByRoute: Record<string, Crumb[]> = {};
  for (const page of await getDocIndex()) {
    headingsByRoute[page.route] = page.headings;
    crumbsByRoute[page.route] = docsTrail(tree, page.route);
  }

  return (
    // `DocsTocProvider` wraps the grid rather than sitting inside it: it is the
    // nearest common ancestor of the two TOC renderers below, which land in two
    // DIFFERENT grid tracks, and it must own the single scroll-spy both share.
    // It renders no element of its own, so the grid's own child list is
    // unchanged and so is its markup.
    <DocsTocProvider headingsByRoute={headingsByRoute}>
      {/*
        Ported verbatim from the shipped HTML's `[data-blume-doc-grid]` class
        attribute (`dist/docs/components/button/index.html`), which resolves
        `RootLayout.astro:557`'s `class:list` for a normal docs page:
        `mx-auto grid grid-cols-1 items-start
         lg:grid-cols-[17.5rem_minmax(0,1fr)]
         xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]`.
        The `data-blume-doc-grid` attribute itself is dropped (§13.3); it was
        a debugging hook with no CSS and no script reading it.
      */}
      <div className="mx-auto grid grid-cols-1 items-start lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]">
        <DocsSidebar primitivesHref={primitivesHref} tree={tree} />
        <div className="px-6 pt-6 pb-10 lg:px-8 xl:px-10">
          {/*
            `RootLayout.astro:684-688`'s order: breadcrumb, mobile TOC, then the
            page header. Task 3.3's breadcrumb is the first line below; the
            `<h1>` that follows lives inside `{children}`
            (`app/docs/[[...slug]]/page.tsx`'s `<article>`), so the mobile TOC
            is the last thing this layout puts before it.

            DEPARTURE FROM TASK 3.3's FILE LIST, reported with the task. That
            brief lists `app/docs/[[...slug]]/page.tsx` as the breadcrumb's
            render site and does not list this file. It cannot be the page:
            the page IS `{children}`, so a breadcrumb rendered there lands
            BELOW the mobile TOC and inverts the order this comment (and
            `RootLayout.astro`) fixes. The dispatch that opened the task
            resolves it the other way and points at this very line, so the
            breadcrumb is mounted here and the file list is the thing that
            gave way.

            Note for whoever diffs build HTML next: React's `useId` numbering is
            derived from each children array's slot index AND its length, and
            this task changes both — the content column goes from one child to
            two, and the grid from two to three. So every generated id under this
            layout shifts. Expected here, and it will shift again in Tasks 3.3
            and 3.4; it is internal id text, not markup structure, and §17.2's
            extractor (route, text, headings, links) cannot see it.
          */}
          <DocsBreadcrumb crumbsByRoute={crumbsByRoute} />
          <DocsTocMobile />
          {children}
        </div>
        {/*
          The third grid track, with `RootLayout.astro:713-718`'s class list
          verbatim minus `data-blume-toc` (§13.3 — a query hook with no CSS and,
          since the custom element is gone, no reader). `aria-label` is the
          third and last live occurrence of "On this page"; the other two are
          the mobile summary's `<span>` and the desktop list's `<p>`.

          Rendered unconditionally, which reproduces Blume: its own guard was
          `showToc = !(isApiOperation || isBare)`, and neither flag is ever set
          on this site. The LIST inside is what disappears when a page has no
          h2/h3 — as does the mobile variant — and no docs page is in that state
          today (the thinnest, `/docs/theming`, has one heading). The
          page-actions rail follows the list, at `RootLayout.astro:724-733`'s
          position.
        */}
        <aside
          aria-label="On this page"
          className="sticky top-16 hidden h-[calc(100dvh-4rem)] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent overflow-y-auto px-4 pt-6 pb-10 text-sm xl:block"
        >
          <DocsTocDesktop />
          {/*
            The rail needs to know whether the current path is a real docs
            page, because `app/docs/not-found.tsx` renders inside this same
            layout and all four of the rail's actions are derived from the
            route — see `page-actions.tsx`'s header. The route list comes from
            the same memoized index the two maps above were built from, so it
            costs no extra filesystem pass. Its only cost is the strings
            themselves, measured on `/docs/components/button`: 69 entries,
            2,032 B once escaped into the inlined flight payload, 415 B gzipped
            on their own and less than that in place — they are a second copy
            of keys `headingsByRoute` has already put in the same payload, well
            inside gzip's window. The heading map beside them is ~38 kB.
          */}
          <DocsPageActions docRoutes={Object.keys(headingsByRoute)} />
        </aside>
      </div>
    </DocsTocProvider>
  );
}
