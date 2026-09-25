"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";

const TOTAL_PAGES = 48;

type PageToken = number | "start-ellipsis" | "end-ellipsis";

function getPageTokens(current: number, total: number): PageToken[] {
  if (current <= 3) return [1, 2, 3, "end-ellipsis", total];
  if (current >= total - 2) {
    return [1, "start-ellipsis", total - 2, total - 1, total];
  }
  return [1, "start-ellipsis", current, "end-ellipsis", total];
}

export default function Pagination07() {
  const [page, setPage] = React.useState(12);
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputId = React.useId();
  const errorId = React.useId();
  const tokens = getPageTokens(page, TOTAL_PAGES);

  function go(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    setPage(Math.min(TOTAL_PAGES, Math.max(1, next)));
    setError(null);
  }

  function jump(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(draft);
    if (!draft.trim() || !Number.isInteger(value)) {
      setError("Enter a whole page number.");
      return;
    }
    if (value < 1 || value > TOTAL_PAGES) {
      setError(`Choose a page between 1 and ${TOTAL_PAGES}.`);
      return;
    }
    setPage(value);
    setDraft("");
    setError(null);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`#page-${page - 1}`}
              aria-disabled={page === 1 || undefined}
              tabIndex={page === 1 ? -1 : undefined}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
              onClick={(event) => go(event, page - 1)}
            />
          </PaginationItem>
          {tokens.map((token) =>
            typeof token === "number" ? (
              <PaginationItem key={token}>
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
            ) : (
              <PaginationItem key={token}>
                <PaginationEllipsis />
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href={`#page-${page + 1}`}
              aria-disabled={page === TOTAL_PAGES || undefined}
              tabIndex={page === TOTAL_PAGES ? -1 : undefined}
              className={
                page === TOTAL_PAGES ? "pointer-events-none opacity-50" : ""
              }
              onClick={(event) => go(event, page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <form
        noValidate
        onSubmit={jump}
        className="flex flex-col items-center gap-1.5 border-t border-border pt-4"
      >
        <div className="flex items-center gap-2">
          <Label htmlFor={inputId} className="text-muted-foreground">
            Go to page
          </Label>
          <Input
            id={inputId}
            inputMode="numeric"
            autoComplete="off"
            placeholder={String(page)}
            value={draft}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            className="w-16 text-center tabular-nums"
          />
          <span className="text-sm text-muted-foreground tabular-nums">
            of {TOTAL_PAGES}
          </span>
          <Button type="submit" variant="secondary">
            Go
          </Button>
        </div>
        <p
          id={errorId}
          role="alert"
          className="min-h-5 text-sm text-destructive"
        >
          {error}
        </p>
      </form>
    </div>
  );
}
