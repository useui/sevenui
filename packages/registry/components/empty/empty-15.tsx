"use client";

import * as React from "react";
import { ActivityIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Range = "24h" | "7d" | "30d";

const ranges: { value: Range; label: string; long: string }[] = [
  { value: "24h", label: "24h", long: "last 24 hours" },
  { value: "7d", label: "7d", long: "last 7 days" },
  { value: "30d", label: "30d", long: "last 30 days" },
];

const referrers: Record<Range, { source: string; visits: number }[]> = {
  "24h": [],
  "7d": [
    { source: "google.com", visits: 1284 },
    { source: "news.ycombinator.com", visits: 612 },
    { source: "github.com", visits: 331 },
    { source: "Direct", visits: 208 },
  ],
  "30d": [
    { source: "google.com", visits: 5120 },
    { source: "news.ycombinator.com", visits: 2044 },
    { source: "github.com", visits: 1398 },
    { source: "x.com", visits: 910 },
  ],
};

const number = new Intl.NumberFormat("en-US");

export default function Empty15() {
  const [range, setRange] = React.useState<Range>("24h");
  const rows = referrers[range];
  const total = rows.reduce((sum, row) => sum + row.visits, 0);
  const current = ranges.find((item) => item.value === range);

  return (
    <section
      aria-labelledby="empty-15-title"
      className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 id="empty-15-title" className="text-sm font-medium">
            Top referrers
          </h2>
          <p className="text-xs text-muted-foreground">
            acme.dev &middot; {current?.long}
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
          {ranges.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              aria-label={item.long}
              className="px-2.5 tabular-nums"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </header>
      <div className="min-h-64 px-2 py-2" aria-live="polite">
        {rows.length === 0 ? (
          <Empty className="h-full min-h-60">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ActivityIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No visits in the last 24 hours</EmptyTitle>
              <EmptyDescription>
                The tracking script on acme.dev last reported 2 days ago. It may
                have been removed in your latest deploy.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm">Check installation</Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRange("7d")}
                >
                  View last 7 days
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead className="w-16 text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const share = Math.round((row.visits / total) * 100);
                return (
                  <TableRow key={row.source}>
                    <TableCell className="max-w-40 truncate font-medium">
                      {row.source}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {number.format(row.visits)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {share}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
