"use client";

import { Skeleton } from "@/registry/base/ui/skeleton";

const densities = [
  {
    name: "Compact",
    detail: "32px rows",
    avatar: "size-6",
    title: "h-2.5 w-28",
    meta: "h-2 w-16",
    gap: "gap-2.5 py-1",
  },
  {
    name: "Default",
    detail: "48px rows",
    avatar: "size-9",
    title: "h-3 w-36",
    meta: "h-2.5 w-24",
    gap: "gap-3 py-1.5",
  },
  {
    name: "Comfortable",
    detail: "64px rows",
    avatar: "size-12",
    title: "h-3.5 w-44",
    meta: "h-3 w-28",
    gap: "gap-4 py-2",
  },
];

export default function Skeleton01() {
  return (
    <div
      role="status"
      aria-label="Loading team members"
      className="flex w-full max-w-sm flex-col divide-y divide-border"
    >
      <span className="sr-only">Loading team members…</span>
      {densities.map((density) => (
        <section
          key={density.name}
          aria-label={`${density.name} density`}
          className="flex flex-col gap-1 py-3 first-of-type:pt-0 last:pb-0"
        >
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium">{density.name}</span>
            <span className="text-muted-foreground tabular-nums">
              {density.detail}
            </span>
          </div>
          <div className={`flex items-center ${density.gap}`}>
            <Skeleton
              aria-hidden="true"
              className={`shrink-0 rounded-full ${density.avatar}`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton
                aria-hidden="true"
                className={`max-w-full ${density.title}`}
              />
              <Skeleton
                aria-hidden="true"
                className={`max-w-full ${density.meta}`}
              />
            </div>
            <Skeleton aria-hidden="true" className="h-2.5 w-10 shrink-0" />
          </div>
        </section>
      ))}
    </div>
  );
}
