"use client";

import { RefreshCwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Spinner } from "@/registry/base/ui/spinner";
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

const data: Record<Range, { path: string; views: number; change: number }[]> = {
  "24h": [
    { path: "/pricing", views: 1_284, change: 12 },
    { path: "/docs/getting-started", views: 962, change: 4 },
    { path: "/blog/usage-based-billing", views: 711, change: 38 },
    { path: "/changelog", views: 406, change: -6 },
  ],
  "7d": [
    { path: "/pricing", views: 8_930, change: 7 },
    { path: "/blog/usage-based-billing", views: 6_115, change: 64 },
    { path: "/docs/getting-started", views: 5_870, change: 2 },
    { path: "/integrations/stripe", views: 2_342, change: -3 },
  ],
  "30d": [
    { path: "/pricing", views: 36_402, change: 9 },
    { path: "/docs/getting-started", views: 24_117, change: 11 },
    { path: "/blog/usage-based-billing", views: 19_880, change: 120 },
    { path: "/integrations/stripe", views: 10_245, change: 5 },
  ],
};

const number = new Intl.NumberFormat("en-US");

export default function Spinner10() {
  const [range, setRange] = useState<Range>("7d");
  const [shown, setShown] = useState<Range>("7d");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState("Updated 4 min ago");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function load(next: Range) {
    setRange(next);
    setLoading(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setShown(next);
      setLoading(false);
      setUpdated("Updated just now");
    }, 1000);
  }

  const label = ranges.find((r) => r.value === range)?.long ?? "";

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Top pages</CardTitle>
        <CardDescription>Unique page views, {label}</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh top pages"
            disabled={loading}
            onClick={() => load(range)}
          >
            {loading ? (
              <Spinner aria-hidden="true" role="presentation" />
            ) : (
              <RefreshCwIcon aria-hidden="true" />
            )}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[range]}
          onValueChange={(value) => {
            const next = value[0] as Range | undefined;
            if (next && next !== range) load(next);
          }}
          aria-label="Time range"
        >
          {ranges.map((r) => (
            <ToggleGroupItem
              key={r.value}
              value={r.value}
              aria-label={`Show ${r.long}`}
            >
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="relative" aria-busy={loading}>
          <Table
            className={
              loading ? "opacity-40 transition-opacity" : "transition-opacity"
            }
          >
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data[shown].map((row) => (
                <TableRow key={row.path}>
                  <TableCell className="max-w-24 truncate font-medium sm:max-w-40">
                    {row.path}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {number.format(row.views)}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${
                      row.change < 0 ? "text-destructive" : "text-success"
                    }`}
                  >
                    {row.change > 0 ? "+" : ""}
                    {row.change}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                <Spinner aria-label={`Loading ${label}`} />
                Loading {label}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <span aria-live="polite">{loading ? "Refreshing…" : updated}</span>
      </CardFooter>
    </Card>
  );
}
