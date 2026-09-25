"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import type { GalleryFamily } from "../../lib/gallery";

export function GalleryNav({
  families,
  onNavigate,
}: {
  families: GalleryFamily[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  // The nav renders twice (sidebar and mobile drawer), so label ids must be per instance.
  const idPrefix = useId();

  // Deep pages (Table, Tooltip) sit far below the fold of a 64-item list; bring the current one into
  // the scroll container's view without scrolling the window itself.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the nav outlives the page, so re-run on navigation
  useEffect(() => {
    const current = navRef.current?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    const scroller = current?.closest("aside");
    if (!(current && scroller)) return;
    const top = current.offsetTop;
    const bottom = top + current.offsetHeight;
    if (
      top < scroller.scrollTop ||
      bottom > scroller.scrollTop + scroller.clientHeight
    ) {
      scroller.scrollTop = top - scroller.clientHeight / 3;
    }
  }, [pathname]);

  return (
    <nav aria-label="Components" className="flex flex-col gap-6" ref={navRef}>
      {families.map((family) => (
        <div key={family.id}>
          <p
            className="mb-1.5 px-2 text-sm font-semibold text-accent-foreground"
            id={`${idPrefix}-${family.id}`}
          >
            {family.label}
          </p>
          <ul
            aria-labelledby={`${idPrefix}-${family.id}`}
            className="flex flex-col gap-0.5"
          >
            {family.components.map((component) => {
              const href = `/components/${component.slug}`;
              const active = pathname === href;
              return (
                <li key={component.slug}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    href={href}
                    onClick={onNavigate}
                  >
                    <span>{component.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {component.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
