"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Range = "7d" | "30d" | "90d";

const ranges: { value: Range; label: string; long: string }[] = [
  { value: "7d", label: "7D", long: "Last 7 days" },
  { value: "30d", label: "30D", long: "Last 30 days" },
  { value: "90d", label: "90D", long: "Last 90 days" },
];

// Page views and change against the previous period, per range.
// A null change marks a page that did not exist in the previous period.
const data: Record<
  Range,
  { path: string; views: number; change: number | null }[]
> = {
  "7d": [
    { path: "/pricing", views: 18_240, change: 12.4 },
    { path: "/", views: 15_902, change: 3.1 },
    { path: "/blog/usage-based-billing", views: 9_310, change: 48.9 },
    { path: "/docs/quickstart", views: 6_455, change: -4.2 },
    { path: "/changelog", views: 2_118, change: -18.6 },
  ],
  "30d": [
    { path: "/", views: 71_480, change: 6.8 },
    { path: "/pricing", views: 64_022, change: 9.5 },
    { path: "/docs/quickstart", views: 30_871, change: 1.2 },
    { path: "/blog/usage-based-billing", views: 22_604, change: 210.3 },
    { path: "/changelog", views: 9_940, change: -7.7 },
  ],
  "90d": [
    { path: "/", views: 205_117, change: 14.0 },
    { path: "/pricing", views: 172_390, change: 11.2 },
    { path: "/docs/quickstart", views: 96_503, change: 5.9 },
    { path: "/changelog", views: 33_280, change: 2.4 },
    { path: "/blog/usage-based-billing", views: 29_870, change: null },
  ],
};

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function Table17() {
  const [range, setRange] = React.useState<Range>("7d");
  const rows = data[range];
  const total = rows.reduce((sum, row) => sum + row.views, 0);
  const max = Math.max(...rows.map((row) => row.views));
  const current = ranges.find((r) => r.value === range);

  return (
    <div className="w-full max-w-xl rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-2">
        <div className="grid gap-1">
          <h3 id="table-17-title" className="font-semibold">
            Top pages
          </h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {compact.format(total)}
            </span>{" "}
            views · {current?.long.toLowerCase()}
          </p>
        </div>
        <ToggleGroup
          aria-label="Date range"
          variant="outline"
          size="sm"
          spacing={0}
          value={[range]}
          onValueChange={(value) => {
            const next = value[0] as Range | undefined;
            if (next) setRange(next);
          }}
        >
          {ranges.map((r) => (
            <ToggleGroupItem key={r.value} value={r.value} aria-label={r.long}>
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Table aria-labelledby="table-17-title">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 text-xs text-muted-foreground">
              Page
            </TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              Views
            </TableHead>
            <TableHead className="pr-4 text-right text-xs text-muted-foreground">
              Change
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const share = (row.views / max) * 100;
            const isNew = row.change === null;
            const up = (row.change ?? 0) >= 0;
            const Arrow = up ? ArrowUpRightIcon : ArrowDownRightIcon;
            return (
              <TableRow key={row.path} className="border-0">
                <TableCell className="relative py-1.5 pl-4">
                  {/* Inline bar sized to this page's views relative to the top page. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-1 left-2 rounded-md bg-chart-2/15 transition-[width] duration-500 ease-out"
                    style={{ width: `calc(${share}% - 0.5rem)` }}
                  />
                  <span className="relative block max-w-28 truncate px-1 font-mono text-xs sm:max-w-64">
                    {row.path}
                  </span>
                </TableCell>
                <TableCell className="py-1.5 text-right font-medium tabular-nums">
                  {compact.format(row.views)}
                </TableCell>
                <TableCell className="py-1.5 pr-4 text-right">
                  {isNew ? (
                    <span className="text-xs text-muted-foreground">New</span>
                  ) : (
                    <span
                      className={
                        up
                          ? "inline-flex items-center gap-0.5 text-xs font-medium text-success tabular-nums"
                          : "inline-flex items-center gap-0.5 text-xs font-medium text-destructive tabular-nums"
                      }
                    >
                      <Arrow aria-hidden="true" className="size-3.5" />
                      <span className="sr-only">{up ? "Up" : "Down"}</span>
                      {Math.abs(row.change ?? 0).toFixed(1)}%
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p className="px-4 pt-1 pb-4 text-xs text-muted-foreground">
        Change is measured against the previous period of the same length.
      </p>
    </div>
  );
}
