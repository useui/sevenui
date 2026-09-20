import { DocsSidebar } from "../../components/docs/sidebar";
import { getNavTree, resolvePrimitivesHref } from "../../lib/docs/nav";

/**
 * The persistent docs layout (§5, §11.1). Wraps all 68 docs routes — 69
 * once Task 3.3 adds `/docs/components` — so the sidebar is mounted once
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

  return (
    // Ported verbatim from the shipped HTML's `[data-blume-doc-grid]` class
    // attribute (`dist/docs/components/button/index.html`), which resolves
    // `RootLayout.astro:557`'s `class:list` for a normal docs page:
    // `mx-auto grid grid-cols-1 items-start
    //  lg:grid-cols-[17.5rem_minmax(0,1fr)]
    //  xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]`.
    // The `data-blume-doc-grid` attribute itself is dropped (§13.3); it was
    // a debugging hook with no CSS and no script reading it.
    <div className="mx-auto grid grid-cols-1 items-start lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]">
      <DocsSidebar primitivesHref={primitivesHref} tree={tree} />
      <div className="px-6 pt-6 pb-10 lg:px-8 xl:px-10">{children}</div>
      {/*
        The third grid track — `<aside aria-label="On this page" …
        xl:block>` — is Task 3.2's, and it is deliberately NOT stubbed here.
        An empty `<aside>` with that label would ship a named but empty
        landmark to production and to every axe run in between; the grid
        template already reserves the column either way, so an empty shell
        buys nothing a comment does not. Task 3.2 inserts the element at
        this position with `RootLayout.astro:713-718`'s class list, and
        Task 3.4 adds the page-actions rail inside it.
      */}
    </div>
  );
}
