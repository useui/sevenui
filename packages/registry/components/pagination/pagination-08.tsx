"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/registry/base/ui/pagination";

const chapters = [
  {
    title: "Why reconciliation matters",
    minutes: 4,
    summary:
      "How unmatched transactions compound into month-end surprises, and what a clean ledger buys you.",
  },
  {
    title: "Importing bank feeds",
    minutes: 7,
    summary:
      "Connect accounts, map columns from CSV exports, and set the date range the first sync should cover.",
  },
  {
    title: "Matching rules",
    minutes: 9,
    summary:
      "Build rules that pair payouts with invoices by amount, reference, and a tolerance window.",
  },
  {
    title: "Handling exceptions",
    minutes: 6,
    summary:
      "Split partial payments, flag duplicates, and write off bank fees without breaking the audit trail.",
  },
  {
    title: "Closing the period",
    minutes: 5,
    summary:
      "Lock the month, export the reconciliation report, and hand it to your accountant for sign-off.",
  },
];

export default function Pagination08() {
  const [index, setIndex] = React.useState(2);
  const chapter = chapters[index];
  const isFirst = index === 0;
  const isLast = index === chapters.length - 1;

  function go(event: React.MouseEvent<HTMLAnchorElement>, next: number) {
    event.preventDefault();
    setIndex(Math.min(chapters.length - 1, Math.max(0, next)));
  }

  return (
    <div className="flex w-full max-w-md items-stretch gap-5">
      <Pagination aria-label="Chapters" className="mx-0 w-auto">
        <PaginationContent className="flex-col gap-1">
          <PaginationItem>
            <PaginationLink
              href={`#chapter-${index}`}
              aria-label="Previous chapter"
              aria-disabled={isFirst || undefined}
              tabIndex={isFirst ? -1 : undefined}
              className={cn(isFirst && "pointer-events-none opacity-40")}
              onClick={(event) => go(event, index - 1)}
            >
              <ChevronUpIcon aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>
          {chapters.map((item, position) => (
            <PaginationItem key={item.title}>
              <PaginationLink
                href={`#chapter-${position + 1}`}
                aria-label={`Chapter ${position + 1}: ${item.title}`}
                isActive={position === index}
                className={cn(
                  "tabular-nums",
                  position < index && "text-muted-foreground",
                )}
                onClick={(event) => go(event, position)}
              >
                {position + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationLink
              href={`#chapter-${index + 2}`}
              aria-label="Next chapter"
              aria-disabled={isLast || undefined}
              tabIndex={isLast ? -1 : undefined}
              className={cn(isLast && "pointer-events-none opacity-40")}
              onClick={(event) => go(event, index + 1)}
            >
              <ChevronDownIcon aria-hidden="true" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <section
        aria-live="polite"
        className="flex min-w-0 flex-1 flex-col justify-center gap-2 border-l border-border pl-5"
      >
        <p className="text-xs text-muted-foreground tabular-nums">
          Chapter {index + 1} of {chapters.length} · {chapter.minutes} min
        </p>
        <h3 className="text-base font-semibold text-balance">
          {chapter.title}
        </h3>
        <p className="text-sm text-pretty text-muted-foreground">
          {chapter.summary}
        </p>
      </section>
    </div>
  );
}
