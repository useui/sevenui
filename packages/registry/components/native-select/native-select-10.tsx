"use client";

import * as React from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

type Range = "7d" | "30d" | "90d";

type Source = { name: string; visits: number };

const ranges: { value: Range; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const sourcesByRange: Record<Range, Source[]> = {
  "7d": [
    { name: "Google Search", visits: 4820 },
    { name: "Direct", visits: 2310 },
    { name: "GitHub", visits: 1455 },
    { name: "Hacker News", visits: 930 },
    { name: "Newsletter", visits: 412 },
  ],
  "30d": [
    { name: "Google Search", visits: 19240 },
    { name: "Direct", visits: 9875 },
    { name: "Newsletter", visits: 6120 },
    { name: "GitHub", visits: 5480 },
    { name: "Hacker News", visits: 2215 },
  ],
  "90d": [
    { name: "Google Search", visits: 58710 },
    { name: "Direct", visits: 30460 },
    { name: "Hacker News", visits: 21980 },
    { name: "GitHub", visits: 16305 },
    { name: "Newsletter", visits: 14870 },
  ],
};

const formatter = new Intl.NumberFormat("en-US");

export default function NativeSelect10() {
  const [range, setRange] = React.useState<Range>("30d");

  const sources = sourcesByRange[range];
  const total = sources.reduce((sum, source) => sum + source.visits, 0);
  const max = Math.max(...sources.map((source) => source.visits));

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Top referrers</CardTitle>
        <CardDescription>
          <span className="font-medium text-foreground tabular-nums">
            {formatter.format(total)}
          </span>{" "}
          visits from 5 sources
        </CardDescription>
        <CardAction>
          <NativeSelect
            size="sm"
            aria-label="Reporting period"
            value={range}
            onChange={(event) => setRange(event.target.value as Range)}
          >
            {ranges.map((item) => (
              <NativeSelectOption key={item.value} value={item.value}>
                {item.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-1.5">
          {sources.map((source) => (
            <li
              key={source.name}
              className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2.5 py-1.5"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-md bg-chart-2/15 transition-[width] duration-300 ease-out"
                style={{ width: `${(source.visits / max) * 100}%` }}
              />
              <span className="relative truncate">{source.name}</span>
              <span className="relative shrink-0 text-muted-foreground tabular-nums">
                {formatter.format(source.visits)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
