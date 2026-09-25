"use client";

import * as React from "react";
import {
  FileCodeIcon,
  FoldVerticalIcon,
  UnfoldVerticalIcon,
} from "lucide-react";
import { cn } from "cn";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

type Line = {
  id: string;
  number?: number;
  kind: "context" | "add" | "remove";
  code: string;
};

type Segment =
  | { kind: "hidden"; id: string; lines: Line[] }
  | { kind: "hunk"; id: string; lines: Line[] };

const segments: Segment[] = [
  {
    kind: "hidden",
    id: "top",
    lines: [
      {
        id: "1",
        number: 1,
        kind: "context",
        code: "type Plan = { price: number; cycleStart: Date };",
      },
      { id: "2", number: 2, kind: "context", code: "" },
      {
        id: "3",
        number: 3,
        kind: "context",
        code: "const differenceInDays = (a: Date, b: Date) =>",
      },
      {
        id: "4",
        number: 4,
        kind: "context",
        code: "  Math.round((a.getTime() - b.getTime()) / 86_400_000);",
      },
    ],
  },
  {
    kind: "hunk",
    id: "prorate",
    lines: [
      {
        id: "5",
        number: 5,
        kind: "context",
        code: "export function prorate(plan: Plan, changedAt: Date) {",
      },
      { id: "6-old", kind: "remove", code: "  const days = 30;" },
      {
        id: "6",
        number: 6,
        kind: "add",
        code: "  const days = daysInCycle(plan.cycleStart);",
      },
      {
        id: "7",
        number: 7,
        kind: "context",
        code: "  const used = differenceInDays(changedAt, plan.cycleStart);",
      },
      {
        id: "8",
        number: 8,
        kind: "add",
        code: "  const remaining = Math.max(days - used, 0);",
      },
      {
        id: "9-old",
        kind: "remove",
        code: "  return (plan.price / days) * (days - used);",
      },
      {
        id: "9",
        number: 9,
        kind: "add",
        code: "  return roundCents((plan.price / days) * remaining);",
      },
      { id: "10", number: 10, kind: "context", code: "}" },
    ],
  },
  {
    kind: "hidden",
    id: "middle",
    lines: [
      { id: "11", number: 11, kind: "context", code: "" },
      {
        id: "12",
        number: 12,
        kind: "context",
        code: "function roundCents(value: number) {",
      },
      {
        id: "13",
        number: 13,
        kind: "context",
        code: "  return Math.round(value * 100) / 100;",
      },
      { id: "14", number: 14, kind: "context", code: "}" },
    ],
  },
  {
    kind: "hunk",
    id: "days-in-cycle",
    lines: [
      { id: "15", number: 15, kind: "context", code: "" },
      {
        id: "16",
        number: 16,
        kind: "add",
        code: "function daysInCycle(start: Date) {",
      },
      {
        id: "17",
        number: 17,
        kind: "add",
        code: "  const end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());",
      },
      {
        id: "18",
        number: 18,
        kind: "add",
        code: "  return differenceInDays(end, start);",
      },
      { id: "19", number: 19, kind: "add", code: "}" },
    ],
  },
];

const signs = {
  context: { symbol: " ", label: "" },
  add: { symbol: "+", label: "Added: " },
  remove: { symbol: "-", label: "Removed: " },
} as const;

function DiffLine({ line }: { line: Line }) {
  const sign = signs[line.kind];
  return (
    <div
      className={cn(
        "flex px-3",
        line.kind === "add" && "bg-success/10",
        line.kind === "remove" && "bg-destructive/10",
      )}
    >
      <span
        aria-hidden="true"
        className="w-7 shrink-0 pr-2 text-right text-muted-foreground tabular-nums select-none"
      >
        {line.number}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "w-4 shrink-0 select-none",
          line.kind === "add" && "text-success",
          line.kind === "remove" && "text-destructive",
        )}
      >
        {sign.symbol}
      </span>
      <code className="pr-3 whitespace-pre">
        {sign.label ? <span className="sr-only">{sign.label}</span> : null}
        {line.code || " "}
      </code>
    </div>
  );
}

export default function Marker06() {
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const baseId = React.useId();

  function toggle(id: string) {
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <section
      aria-labelledby={`${baseId}-file`}
      className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <FileCodeIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <h3 id={`${baseId}-file`} className="min-w-0 truncate font-mono text-xs">
          src/billing/proration.ts
        </h3>
        <span className="ml-auto flex shrink-0 gap-2 font-mono text-xs tabular-nums">
          <span className="text-success">
            +7<span className="sr-only"> additions</span>
          </span>
          <span className="text-destructive">
            -2<span className="sr-only"> deletions</span>
          </span>
        </span>
      </header>
      <div className="@container overflow-x-auto py-1.5">
        <div className="w-max min-w-full font-mono text-xs leading-5">
          {segments.map((segment) => {
            if (segment.kind === "hunk") {
              return segment.lines.map((line) => (
                <DiffLine key={line.id} line={line} />
              ));
            }
            const isOpen = expanded.includes(segment.id);
            const panelId = `${baseId}-${segment.id}`;
            const count = segment.lines.length;
            return (
              <React.Fragment key={segment.id}>
                <Marker
                  variant="separator"
                  render={<button type="button" />}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(segment.id)}
                  className="sticky left-0 my-1 w-[100cqw] cursor-pointer bg-muted/50 px-3 py-1 font-sans text-xs transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <MarkerIcon className="size-3.5">
                    {isOpen ? (
                      <FoldVerticalIcon className="size-3.5" />
                    ) : (
                      <UnfoldVerticalIcon className="size-3.5" />
                    )}
                  </MarkerIcon>
                  <MarkerContent>
                    {isOpen ? "Hide" : "Expand"} {count} unchanged lines
                  </MarkerContent>
                </Marker>
                <div id={panelId} hidden={!isOpen}>
                  {segment.lines.map((line) => (
                    <DiffLine key={line.id} line={line} />
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
