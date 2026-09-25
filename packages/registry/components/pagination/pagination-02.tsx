"use client";

import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";

const densities = [
  {
    id: "compact",
    label: "Compact",
    hint: "Dense tables and toolbars",
    pageSize: "icon-sm",
    stepSize: "sm",
    text: "text-xs",
  },
  {
    id: "default",
    label: "Default",
    hint: "Lists and search results",
    pageSize: "icon",
    stepSize: "default",
    text: "text-sm",
  },
  {
    id: "comfortable",
    label: "Comfortable",
    hint: "Touch-first and marketing pages",
    pageSize: "icon-lg",
    stepSize: "lg",
    text: "text-sm",
  },
] as const;

const pages = [1, 2, 3, 4, 5];

function SizedPagination({
  density,
}: {
  density: (typeof densities)[number];
}) {
  const [page, setPage] = React.useState(2);

  function go(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    setPage(Math.min(pages.length, Math.max(1, next)));
  }

  // Below sm, show a three-page window around the current page so the
  // larger densities still fit a phone-width row.
  const windowStart = Math.min(Math.max(page - 1, 1), pages.length - 2);

  return (
    <Pagination
      aria-label={`${density.label} pagination`}
      className="w-auto justify-start"
    >
      <PaginationContent className={density.stepSize === "lg" ? "gap-1" : ""}>
        <PaginationItem>
          <PaginationPrevious
            href={`#${density.id}-page-${page - 1}`}
            size={density.stepSize}
            aria-disabled={page === 1 || undefined}
            tabIndex={page === 1 ? -1 : undefined}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
            onClick={(event) => go(event, page - 1)}
          />
        </PaginationItem>
        {pages.map((item) => (
          <PaginationItem
            key={item}
            className={
              item < windowStart || item > windowStart + 2
                ? "hidden sm:block"
                : undefined
            }
          >
            <PaginationLink
              href={`#${density.id}-page-${item}`}
              size={density.pageSize}
              isActive={item === page}
              aria-label={`Page ${item}`}
              className={`tabular-nums ${density.text}`}
              onClick={(event) => go(event, item)}
            >
              {item}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={`#${density.id}-page-${page + 1}`}
            size={density.stepSize}
            aria-disabled={page === pages.length || undefined}
            tabIndex={page === pages.length ? -1 : undefined}
            className={
              page === pages.length ? "pointer-events-none opacity-50" : ""
            }
            onClick={(event) => go(event, page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default function Pagination02() {
  return (
    <div className="flex w-full max-w-md flex-col divide-y divide-border">
      {densities.map((density) => (
        <div
          key={density.id}
          className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-sm font-medium">{density.label}</p>
            <p className="text-xs text-muted-foreground">{density.hint}</p>
          </div>
          <SizedPagination density={density} />
        </div>
      ))}
    </div>
  );
}
