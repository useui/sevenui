import { BlocksNav, type BlocksNavGroup } from "./blocks-nav";

/**
 * Category sidebar for the /blocks gallery (directory, group and category
 * pages), ported class-for-class from `legacy-components/blocks-sidebar.astro`.
 * One disclosure per group listing its categories with block counts.
 *
 * Desktop only: an always-visible left column, flush against the viewport
 * edge, separated from the content column by a border (a docs-style structural
 * line, not the landing's decorative rail/crop-mark apparatus), and sticky so
 * it stays visible while the content scrolls. Below the large breakpoint the
 * same tree is reached through the header's nav drawer
 * (`components/blocks/blocks-drawer.tsx`), which every /blocks page carries.
 *
 * The sticky offset below — the large-breakpoint top and height pair — mirrors
 * Blume's own docs sidebar (`node_modules/blume/src/components/layout/
 * RootLayout.astro`), whose nav drawer uses the identical pairing for its
 * 4rem-tall header. Ours is the same 4rem header, so the same numbers.
 *
 * NAVIGATION ONLY. The theme customizer used to hang below this tree; it lives
 * in its own dock now, rendered by the three /blocks pages (Task 5.3c). Do NOT
 * render the dock from here — it must exist exactly once per page, and three
 * pages each rendering a sidebar that also rendered a dock is how you get two.
 *
 * The Astro source's header also described a "Categories" disclosure buried in
 * the page body, replaced by the header hamburger. That disclosure is not in
 * its markup any more, so the sentence is dropped rather than ported.
 *
 * `groups` is the nav tree's own prop shape, not `lib/blocks.ts`'s `Group[]` —
 * see `blocks-nav.tsx` for what crosses the client boundary and why the caller
 * builds each group's icon element.
 */
export function BlocksSidebar({ groups }: { groups: BlocksNavGroup[] }) {
  return (
    <div className="hidden lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:border-r lg:border-border lg:px-5 lg:py-8">
      <nav aria-label="Block categories">
        <BlocksNav groups={groups} />
      </nav>
    </div>
  );
}
