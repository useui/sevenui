"use client";

import * as React from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const visits = [
  { day: "Mon", value: 3120 },
  { day: "Tue", value: 4480 },
  { day: "Wed", value: 4010 },
  { day: "Thu", value: 5290 },
  { day: "Fri", value: 4870 },
  { day: "Sat", value: 2240 },
  { day: "Sun", value: 1980 },
];

const pages = [
  { path: "/pricing", views: 8412, change: "+12%" },
  { path: "/docs/getting-started", views: 6205, change: "+4%" },
  { path: "/blog/usage-based-billing", views: 3981, change: "+31%" },
  { path: "/changelog", views: 2117, change: "-6%" },
  { path: "/careers", views: 1302, change: "+2%" },
];

const total = visits.reduce((sum, item) => sum + item.value, 0);
const peak = Math.max(...visits.map((item) => item.value));
const number = new Intl.NumberFormat("en-US");

export default function Resizable12() {
  const [chartHeight, setChartHeight] = React.useState<number | null>(null);
  const compact = chartHeight !== null && chartHeight < 130;

  return (
    <div className="h-[420px] w-full max-w-lg">
      <ResizablePanelGroup
        orientation="vertical"
        className="rounded-xl border bg-card text-card-foreground"
      >
        <ResizablePanel
          defaultSize="55%"
          minSize="22%"
          maxSize="75%"
          onResize={(size) => setChartHeight(size.inPixels)}
        >
          <section
            aria-labelledby="resizable-12-title"
            className="flex h-full flex-col gap-3 p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 id="resizable-12-title" className="text-sm font-semibold">
                Visitors this week
              </h3>
              <span className="text-lg font-semibold tabular-nums">
                {number.format(total)}
              </span>
            </div>
            {compact ? (
              <p className="text-xs text-muted-foreground">
                Peak on Thursday with {number.format(peak)} visitors. Drag the
                divider down to see the daily breakdown.
              </p>
            ) : (
              <ul
                aria-label="Daily visitors"
                className="flex min-h-0 flex-1 items-end gap-1.5"
              >
                {visits.map((item) => (
                  <li
                    key={item.day}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  >
                    <span className="sr-only">
                      {item.day}: {number.format(item.value)} visitors
                    </span>
                    <span
                      aria-hidden="true"
                      className="w-full rounded-t-sm bg-chart-1 transition-[height] duration-200 ease-out"
                      style={{ height: `${(item.value / peak) * 100}%` }}
                    />
                    <span
                      aria-hidden="true"
                      className="text-[11px] text-muted-foreground"
                    >
                      {item.day}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize chart and table" />
        <ResizablePanel defaultSize="45%" minSize="25%">
          <div className="h-full overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full pl-4">Top page</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="pr-4 text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.path}>
                    <TableCell className="max-w-0 truncate pl-4 font-mono text-xs">
                      {page.path}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {number.format(page.views)}
                    </TableCell>
                    <TableCell
                      className={
                        page.change.startsWith("-")
                          ? "pr-4 text-right text-destructive tabular-nums"
                          : "pr-4 text-right text-success tabular-nums"
                      }
                    >
                      {page.change}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
