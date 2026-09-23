"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useDrawer } from "../drawer-context";

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

  const segments = pathname.split("/").filter(Boolean);
  const inSection = segments[0] === "blocks";
  const activeGroup = inSection ? segments[1] : undefined;
  const activeCategory = inSection ? segments[2] : undefined;

  const closeDrawer = () => setOpen(false);

  return (
    <div className="flex flex-col gap-1">
      {groups.map((group) => (
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
