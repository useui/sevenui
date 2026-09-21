"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useDrawer } from "../drawer-context";

/**
 * The /blocks group -> category tree, ported from
 * `legacy-components/blocks-sidebar-nav.astro`. One tree, two mounts, exactly
 * as the Astro version had: the desktop sidebar column
 * (`components/blocks/blocks-sidebar.tsx`) and the mobile nav drawer
 * (`components/blocks/blocks-drawer.tsx`).
 *
 * WHY THE ACTIVE STATE IS DERIVED HERE AND NOT PASSED IN. The Astro source
 * took `activeGroup`/`activeCategory` as props, because every navigation was a
 * full page load and each page knew its own place in the tree. This version
 * derives both from `usePathname()`, and the reason is structural rather than
 * stylistic: `app/blocks/layout.tsx` sits ABOVE the `[group]` segment, so the
 * App Router does not re-render it when the group changes on a client-side
 * navigation. An `activeGroup` computed in that layout and threaded down would
 * be correct on first paint and stale from the second category click onward.
 * This is §5's rule arriving for the third time on this site — the list is
 * built on the SERVER and handed down as plain data, and only the active-row
 * decision is client-side — and `components/gallery/nav.tsx` is the precedent
 * it follows. `usePathname()` resolves during prerender, so the active row
 * and the open disclosure are in the prerendered HTML too, not a
 * hydration-time flip.
 *
 * WHAT CROSSES THE CLIENT BOUNDARY. Plain data, plus one already-rendered
 * element per group. `lucideIcon()` lives behind `server-only` (it reaches
 * into lucide-react's ~1,800-entry `icons` record), so the manifest's kebab
 * icon key cannot be resolved here; a Server Component may hand JSX to a
 * Client Component as a prop, and that is the ordinary shape for exactly this
 * problem. The caller therefore builds the icon element — the whole of it,
 * classes included — and passes it as `icon`. The whole mapping, which is the
 * contract between this component and `app/blocks/layout.tsx`:
 *
 *     const navGroups = groups.map((group) => {
 *       const Icon = group.icon ? lucideIcon(group.icon) : null;
 *       return {
 *         id: group.id,
 *         label: group.label,
 *         itemCount: group.items.length,
 *         icon: Icon ? <Icon aria-hidden="true" className={ICON_CLASS} /> : null,
 *         categories: group.categories.map((category) => ({
 *           id: category.id,
 *           label: category.label,
 *           itemCount: category.items.length,
 *         })),
 *       };
 *     });
 *
 * Both counts come off the joined tree's own arrays, never off the manifest:
 * `lib/blocks.ts` has already resolved which items belong to which category
 * and which categories to which group.
 *
 * `ICON_CLASS` above stands in for a literal, and deliberately so — Tailwind's
 * scanner reads class names out of comments, so a real class string written
 * here would keep its CSS rules alive even after the markup stopped using
 * them. Build it from the chevron's class list in the `<summary>` below: the
 * same icon size and the same muted foreground colour, leaving out the two
 * utilities the chevron adds for its own layout and its open-state rotation.
 *
 * The prop type is spelled out below rather than reusing `Group` from
 * `lib/blocks.ts`, so what is serialized into the flight payload is obvious at
 * a glance. Notably it does NOT carry descriptions or cover assets: this tree
 * renders neither, and they are the bulk of the manifest.
 *
 * TWO ADDITIONS over the Astro source, both matching what the gallery nav
 * already does and both declared-diff territory:
 *   - the active category link gains `aria-current="page"` (the §17.6 #39
 *     precedent — accessibility tree only, both visible class strings
 *     unchanged, deliberately, so the change is invisible to anything but a
 *     screen reader);
 *   - links are `next/link`, and a click closes the nav drawer. The drawer
 *     state is read through `useDrawer()` rather than taken as a callback
 *     prop, so the SAME component works unchanged in the desktop sidebar
 *     column — where there is no open drawer and `setOpen(false)` is a state
 *     bail-out, not a no-op hack — and in the drawer. Astro needed neither:
 *     a full page load reset the drawer for free.
 */

export interface BlocksNavCategory {
  id: string;
  label: string;
  itemCount: number;
}

export interface BlocksNavGroup {
  id: string;
  label: string;
  itemCount: number;
  /** Rendered by the caller — see the note on the client boundary above. */
  icon: ReactNode;
  categories: BlocksNavCategory[];
}

export function BlocksNav({ groups }: { groups: BlocksNavGroup[] }) {
  const { setOpen } = useDrawer();
  const pathname = usePathname();

  // `/blocks` -> [], `/blocks/marketing` -> ["marketing"],
  // `/blocks/marketing/cta` -> ["marketing", "cta"]. The `blocks` guard keeps
  // this honest if the tree is ever mounted outside the section.
  const segments = pathname.split("/").filter(Boolean);
  const inSection = segments[0] === "blocks";
  const activeGroup = inSection ? segments[1] : undefined;
  const activeCategory = inSection ? segments[2] : undefined;

  const closeDrawer = () => setOpen(false);

  return (
    <div className="flex flex-col gap-1">
      {groups.map((group) => (
        // Open rule ported exactly: everything is open on the directory page,
        // where no group is active; elsewhere only the active group is.
        <details className="group" key={group.id} open={!activeGroup || group.id === activeGroup}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-1.5">
              <ChevronRight
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-90"
              />
              {group.icon}
              {group.label}
            </span>
            <span className="text-xs text-muted-foreground">{group.itemCount}</span>
          </summary>
          <ul className="mt-1 flex flex-col gap-0.5 pl-6">
            {group.categories.map((category) => {
              const isActive = group.id === activeGroup && category.id === activeCategory;
              return (
                <li key={category.id}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    href={`/blocks/${group.id}/${category.id}`}
                    onClick={closeDrawer}
                  >
                    <span>{category.label}</span>
                    <span className="text-xs text-muted-foreground">{category.itemCount}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
}
