"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { GalleryComponent } from "../../lib/gallery";

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
