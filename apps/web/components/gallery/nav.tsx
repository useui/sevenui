"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { GalleryComponent } from "../../lib/gallery";

/**
 * The `/components` list, ported from
 * `legacy-components/component-gallery-nav.astro`. One tree, two mounts —
 * exactly as the Astro version was: the desktop sidebar column
 * (`app/components/layout.tsx`) and the mobile nav drawer
 * (`components/site-drawer.tsx`).
 *
 * The third client sidebar (§5), same rule as the docs one: the list is
 * built on the SERVER (`lib/gallery.ts`, which reads two registry JSON
 * files) and handed down as plain serialized data; only the active-row
 * decision is client-side, because App Router does not re-render a shared
 * layout when navigating between its children, so Astro's per-request
 * `Astro.props.active` has no equivalent. `usePathname()` resolves during
 * prerender, so the active row is in the static HTML too.
 *
 * Only the TYPE is imported from `lib/gallery.ts` — `import type` is erased
 * before any bundler sees it, so the two registry JSON files stay out of the
 * client bundle.
 *
 * `aria-current="page"` is NEW (§17.6): the Astro source marked the active
 * link with classes only, which left it indistinguishable in the
 * accessibility tree. The two class strings are unchanged from that source,
 * deliberately — re-expressing the active state as attribute-conditional
 * utilities would be a styling rewrite riding along with an accessibility
 * fix, and this change is meant to be invisible to anything but a screen
 * reader.
 *
 * `onNavigate` exists for the drawer mount only: a link tap there has to
 * close the drawer, because this tree persists across client-side
 * navigations (Astro got the reset for free from a full page load). The
 * desktop sidebar passes nothing.
 */
export function GalleryNav({
  components,
  onNavigate,
}: {
  components: GalleryComponent[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Components">
      <ul className="flex flex-col gap-0.5">
        {components.map((component) => {
          const href = `/components/${component.slug}`;
          const active = pathname === href;
          return (
            <li key={component.slug}>
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                href={href}
                onClick={onNavigate}
              >
                <span>{component.label}</span>
                <span className="text-xs text-muted-foreground">{component.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
