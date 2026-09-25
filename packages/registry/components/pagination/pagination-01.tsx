"use client";

import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";

const TOTAL_PAGES = 24;

type PageToken = number | "start-ellipsis" | "end-ellipsis";

// Always show the first and last page, the current page, and one sibling on
// each side; collapse everything else into an ellipsis.
function getPageTokens(current: number, total: number): PageToken[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const start = Math.max(2, Math.min(current - 1, total - 4));
  const end = Math.min(total - 1, Math.max(current + 1, 5));
  const tokens: PageToken[] = [1];
  if (start > 2) tokens.push("start-ellipsis");
  for (let page = start; page <= end; page++) tokens.push(page);
  if (end < total - 1) tokens.push("end-ellipsis");
  tokens.push(total);
  return tokens;
}

// Phone-width variant: first, current, and last page only, with ellipses
// marking every gap so the collapsed range stays legible.
function getCompactTokens(current: number, total: number): PageToken[] {
  const pages = Array.from(new Set([1, current, total])).sort((a, b) => a - b);
  const tokens: PageToken[] = [];
  pages.forEach((value, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && value - previous === 2) {
      tokens.push(previous + 1);
    } else if (previous !== undefined && value - previous > 2) {
      tokens.push(index === 1 ? "start-ellipsis" : "end-ellipsis");
    }
    tokens.push(value);
  });
  return tokens;
}

function renderToken(
  token: PageToken,
  className: string,
  keyPrefix: string,
  page: number,
  go: (event: React.MouseEvent<HTMLAnchorElement>, next: number) => void,
) {
  if (typeof token !== "number") {
    return (
      <PaginationItem key={`${keyPrefix}-${token}`} className={className}>
        <PaginationEllipsis />
      </PaginationItem>
    );
  }
  return (
    <PaginationItem key={`${keyPrefix}-${token}`} className={className}>
      <PaginationLink
        href={`#page-${token}`}
        aria-label={`Page ${token}`}
        isActive={token === page}
        className="tabular-nums"
        onClick={(event) => go(event, token)}
      >
        {token}
      </PaginationLink>
    </PaginationItem>
  );
}

const disabledClass = "pointer-events-none opacity-50";

export default function Pagination01() {
  const [page, setPage] = React.useState(6);
  const tokens = getPageTokens(page, TOTAL_PAGES);
  const compactTokens = getCompactTokens(page, TOTAL_PAGES);
  const isFirst = page === 1;
  const isLast = page === TOTAL_PAGES;

  function go(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    setPage(Math.min(TOTAL_PAGES, Math.max(1, next)));
  }

  return (
    <Pagination className="w-full max-w-md">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`#page-${page - 1}`}
            aria-disabled={isFirst || undefined}
            tabIndex={isFirst ? -1 : undefined}
            className={isFirst ? disabledClass : undefined}
            onClick={(event) => go(event, page - 1)}
          />
        </PaginationItem>
        {tokens.map((token) =>
          renderToken(token, "hidden sm:block", "wide", page, go),
        )}
        {compactTokens.map((token) =>
          renderToken(token, "sm:hidden", "compact", page, go),
        )}
        <PaginationItem>
          <PaginationNext
            href={`#page-${page + 1}`}
            aria-disabled={isLast || undefined}
            tabIndex={isLast ? -1 : undefined}
            className={isLast ? disabledClass : undefined}
            onClick={(event) => go(event, page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
