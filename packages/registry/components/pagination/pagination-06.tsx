"use client";

import * as React from "react";
import { cn } from "cn";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";
import { Spinner } from "@/registry/base/ui/spinner";

const TOTAL_PAGES = 5;
const PAGE_SIZE = 25;
const TOTAL_ITEMS = 118;
const LATENCY_MS = 900;

export default function Pagination06() {
  const [page, setPage] = React.useState(1);
  const [pending, setPending] = React.useState<number | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear a request still in flight when the example unmounts.
  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function request(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    if (pending !== null || next === page || next < 1 || next > TOTAL_PAGES) {
      return;
    }
    setPending(next);
    // Simulates the round trip to the server before the page commits.
    timer.current = setTimeout(() => {
      setPage(next);
      setPending(null);
    }, LATENCY_MS);
  }

  const busy = pending !== null;
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, TOTAL_ITEMS);
  const lockClass = "pointer-events-none opacity-50";

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <Pagination aria-busy={busy}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`#page-${page - 1}`}
              aria-disabled={busy || page === 1 || undefined}
              tabIndex={busy || page === 1 ? -1 : undefined}
              className={cn((busy || page === 1) && lockClass)}
              onClick={(event) => request(event, page - 1)}
            />
          </PaginationItem>
          {Array.from({ length: TOTAL_PAGES }, (_, index) => index + 1).map(
            (item) => {
              const isPending = item === pending;
              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    href={`#page-${item}`}
                    aria-label={`Page ${item}`}
                    isActive={item === page}
                    aria-disabled={(busy && !isPending) || undefined}
                    className={cn(
                      "tabular-nums",
                      busy && "pointer-events-none",
                      busy && !isPending && item !== page && "opacity-50",
                      isPending && "bg-muted text-foreground",
                    )}
                    onClick={(event) => request(event, item)}
                  >
                    {isPending ? (
                      <Spinner aria-label={`Loading page ${item}`} />
                    ) : (
                      item
                    )}
                  </PaginationLink>
                </PaginationItem>
              );
            },
          )}
          <PaginationItem>
            <PaginationNext
              href={`#page-${page + 1}`}
              aria-disabled={busy || page === TOTAL_PAGES || undefined}
              tabIndex={busy || page === TOTAL_PAGES ? -1 : undefined}
              className={cn((busy || page === TOTAL_PAGES) && lockClass)}
              onClick={(event) => request(event, page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p
        aria-live="polite"
        className="text-sm text-muted-foreground tabular-nums"
      >
        {busy ? (
          `Loading page ${pending}…`
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-foreground">
              {first}–{last}
            </span>{" "}
            of {TOTAL_ITEMS} invoices
          </>
        )}
      </p>
    </div>
  );
}
