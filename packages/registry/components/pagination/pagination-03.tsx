"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/registry/base/ui/pagination";

const TOTAL_PAGES = 18;

type PageToken = number | "start-ellipsis" | "end-ellipsis";

function getPageTokens(current: number, total: number): PageToken[] {
  if (current <= 3) return [1, 2, 3, 4, "end-ellipsis", total];
  if (current >= total - 2) {
    return [1, "start-ellipsis", total - 3, total - 2, total - 1, total];
  }
  return [1, "start-ellipsis", current, current + 1, "end-ellipsis", total];
}

// Joined cells: square inner corners, a hairline divider, and a filled
// primary cell for the current page instead of the default outline.
const cellClass =
  "h-8 min-w-8 rounded-none border-0 px-2 tabular-nums focus-visible:z-10 focus-visible:ring-inset sm:h-9 sm:min-w-9 sm:px-3";
const activeClass =
  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:hover:bg-primary/90";
const disabledClass = "pointer-events-none text-muted-foreground/50";

export default function Pagination03() {
  const [page, setPage] = React.useState(1);
  const tokens = getPageTokens(page, TOTAL_PAGES);

  function go(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    setPage(Math.min(TOTAL_PAGES, Math.max(1, next)));
  }

  return (
    <Pagination className="w-full max-w-md">
      <PaginationContent className="gap-0 divide-x divide-border overflow-hidden rounded-lg border border-border bg-card shadow-xs">
        <PaginationItem>
          <PaginationLink
            href={`#page-${page - 1}`}
            aria-label="Go to previous page"
            aria-disabled={page === 1 || undefined}
            tabIndex={page === 1 ? -1 : undefined}
            className={cn(cellClass, page === 1 && disabledClass)}
            onClick={(event) => go(event, page - 1)}
          >
            <ChevronLeftIcon aria-hidden="true" className="cn-rtl-flip" />
          </PaginationLink>
        </PaginationItem>
        {tokens.map((token) =>
          typeof token === "number" ? (
            <PaginationItem key={token}>
              <PaginationLink
                href={`#page-${token}`}
                aria-label={`Page ${token}`}
                isActive={token === page}
                className={cn(cellClass, token === page && activeClass)}
                onClick={(event) => go(event, token)}
              >
                {token}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={token}>
              <PaginationEllipsis className="text-muted-foreground sm:size-9" />
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationLink
            href={`#page-${page + 1}`}
            aria-label="Go to next page"
            aria-disabled={page === TOTAL_PAGES || undefined}
            tabIndex={page === TOTAL_PAGES ? -1 : undefined}
            className={cn(cellClass, page === TOTAL_PAGES && disabledClass)}
            onClick={(event) => go(event, page + 1)}
          >
            <ChevronRightIcon aria-hidden="true" className="cn-rtl-flip" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
