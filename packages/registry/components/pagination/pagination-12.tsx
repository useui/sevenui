"use client";

import * as React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/registry/base/ui/pagination";

type Change = { kind: "New" | "Improved" | "Fixed"; text: string };

// Newest release first, one release per page.
const releases: {
  version: string;
  date: string;
  title: string;
  changes: Change[];
}[] = [
  {
    version: "2.6.0",
    date: "September 22, 2026",
    title: "Saved views",
    changes: [
      { kind: "New", text: "Save any filter and sort combination as a named view." },
      { kind: "New", text: "Share views with your workspace from the view menu." },
      { kind: "Fixed", text: "Column widths no longer reset after a refresh." },
    ],
  },
  {
    version: "2.5.0",
    date: "September 8, 2026",
    title: "Bulk editing",
    changes: [
      { kind: "New", text: "Select up to 500 rows and edit a field in one step." },
      { kind: "Improved", text: "Undo now covers bulk changes for 30 seconds." },
    ],
  },
  {
    version: "2.4.2",
    date: "August 27, 2026",
    title: "Faster exports",
    changes: [
      { kind: "Improved", text: "CSV exports of 100k rows finish 4× faster." },
      { kind: "Fixed", text: "Exported dates now respect your workspace time zone." },
    ],
  },
  {
    version: "2.4.0",
    date: "August 12, 2026",
    title: "Keyboard navigation",
    changes: [
      { kind: "New", text: "Move between cells with arrow keys and edit with Enter." },
      { kind: "Improved", text: "Focus rings are visible in high contrast mode." },
      { kind: "Fixed", text: "Escape closes the cell editor without saving." },
    ],
  },
  {
    version: "2.3.0",
    date: "July 29, 2026",
    title: "Audit history",
    changes: [
      { kind: "New", text: "See who changed a record and restore any earlier value." },
    ],
  },
];

const kindVariant: Record<Change["kind"], "default" | "secondary" | "outline"> = {
  New: "default",
  Improved: "secondary",
  Fixed: "outline",
};

export default function Pagination12() {
  const [index, setIndex] = React.useState(0);
  const release = releases[index];
  const newer = releases[index - 1];
  const older = releases[index + 1];

  function goTo(event: React.MouseEvent, next: number) {
    event.preventDefault();
    if (next >= 0 && next < releases.length) setIndex(next);
  }

  return (
    <article
      aria-labelledby="release-title"
      className="w-full max-w-lg"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="release-title" className="text-xl font-semibold text-balance">
          {release.title}
        </h2>
        <p className="text-sm text-muted-foreground tabular-nums">
          v{release.version} · {release.date}
        </p>
      </header>

      <ul className="mt-4 flex min-h-36 flex-col gap-3" aria-live="polite">
        {release.changes.map((change) => (
          <li key={change.text} className="flex items-start gap-3 text-sm">
            <Badge variant={kindVariant[change.kind]} className="mt-px w-18">
              {change.kind}
            </Badge>
            <span className="leading-relaxed">{change.text}</span>
          </li>
        ))}
      </ul>

      <Pagination aria-label="Release notes" className="mt-6 border-t pt-4">
        <PaginationContent className="grid w-full grid-cols-2 gap-3">
          <PaginationItem>
            {newer ? (
              <PaginationLink
                href="#"
                size="default"
                onClick={(event) => goTo(event, index - 1)}
                className="h-auto w-full flex-col items-start gap-0.5 border border-border px-3 py-2.5 text-left whitespace-normal"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowLeftIcon aria-hidden="true" className="size-3 cn-rtl-flip" />
                  Newer · v{newer.version}
                </span>
                <span className="line-clamp-1 font-medium">{newer.title}</span>
              </PaginationLink>
            ) : (
              <p className="px-3 py-2.5 text-xs text-muted-foreground">
                You're on the latest release.
              </p>
            )}
          </PaginationItem>
          <PaginationItem>
            {older ? (
              <PaginationLink
                href="#"
                size="default"
                onClick={(event) => goTo(event, index + 1)}
                className="h-auto w-full flex-col items-end gap-0.5 border border-border px-3 py-2.5 text-right whitespace-normal"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  Older · v{older.version}
                  <ArrowRightIcon aria-hidden="true" className="size-3 cn-rtl-flip" />
                </span>
                <span className="line-clamp-1 font-medium">{older.title}</span>
              </PaginationLink>
            ) : (
              <p className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                That's every release since 2.3.
              </p>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="mt-3 text-center text-xs text-muted-foreground tabular-nums">
        Release {index + 1} of {releases.length}
      </p>
    </article>
  );
}
