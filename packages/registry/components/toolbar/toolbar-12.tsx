"use client";

import { ChevronDownIcon, DownloadIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Toggle } from "@/registry/base/ui/toggle";
import { ToggleGroup } from "@/registry/base/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

type Range = "7d" | "30d" | "90d";
type Metric = "visitors" | "signups";

const series: Record<Metric, Record<Range, number[]>> = {
  visitors: {
    "7d": [3120, 3480, 2980, 4210, 4630, 2410, 2190],
    "30d": [21400, 24800, 23100, 27900, 26300, 29800, 31200, 28700],
    "90d": [81200, 88400, 94100, 90300, 102600, 110900],
  },
  signups: {
    "7d": [84, 97, 71, 122, 131, 58, 49],
    "30d": [512, 604, 571, 688, 642, 731, 790, 702],
    "90d": [1980, 2210, 2350, 2270, 2590, 2840],
  },
};

const labels: Record<Range, string[]> = {
  "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "30d": ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
  "90d": ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
};

const metricLabels: Record<Metric, string> = {
  visitors: "Unique visitors",
  signups: "Sign-ups",
};

const ranges: { value: Range; label: string; full: string }[] = [
  { value: "7d", label: "7D", full: "Last 7 days" },
  { value: "30d", label: "30D", full: "Last 30 days" },
  { value: "90d", label: "90D", full: "Last 90 days" },
];

const numberFormat = new Intl.NumberFormat("en-US");

export default function Toolbar12() {
  const [range, setRange] = useState<Range>("7d");
  const [metric, setMetric] = useState<Metric>("visitors");
  const [refreshedAt, setRefreshedAt] = useState("2 min ago");

  const values = series[metric][range];
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...values);
  const rangeLabel = ranges.find((item) => item.value === range)?.full;

  function exportCsv() {
    const rows = [
      ["period", metric],
      ...values.map((value, index) => [labels[range][index], String(value)]),
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${metric}-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      aria-labelledby="toolbar-12-title"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-xs"
    >
      <Toolbar
        aria-label="Chart controls"
        className="w-full flex-wrap bg-muted/40 shadow-none"
      >
        <DropdownMenu>
          <ToolbarButton render={<DropdownMenuTrigger />}>
            {metricLabels[metric]}
            <ChevronDownIcon
              aria-hidden="true"
              className="text-muted-foreground"
            />
          </ToolbarButton>
          <DropdownMenuContent className="w-44">
            <DropdownMenuRadioGroup
              value={metric}
              onValueChange={(value) => setMetric(value as Metric)}
            >
              {(Object.keys(metricLabels) as Metric[]).map((key) => (
                <DropdownMenuRadioItem
                  key={key}
                  value={key}
                  closeOnClick
                >
                  {metricLabels[key]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ToolbarSeparator className="hidden sm:block" />
        <ToggleGroup
          aria-label="Date range"
          value={[range]}
          onValueChange={(value) => {
            if (value.length > 0) setRange(value[0] as Range);
          }}
        >
          {ranges.map((item) => (
            <ToolbarButton
              key={item.value}
              render={<Toggle size="sm" />}
              value={item.value}
              aria-label={item.full}
              className="tabular-nums"
            >
              {item.label}
            </ToolbarButton>
          ))}
        </ToggleGroup>
        <ToolbarGroup aria-label="Data" className="ml-auto">
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton
                  aria-label="Refresh data"
                  onClick={() => setRefreshedAt("just now")}
                />
              }
            >
              <RefreshCwIcon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>Updated {refreshedAt}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton aria-label="Export as CSV" onClick={exportCsv} />
              }
            >
              <DownloadIcon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>Export as CSV</TooltipContent>
          </Tooltip>
        </ToolbarGroup>
      </Toolbar>

      <div className="flex flex-col gap-0.5">
        <h3 id="toolbar-12-title" className="text-sm text-muted-foreground">
          {metricLabels[metric]} · {rangeLabel}
        </h3>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {numberFormat.format(total)}
        </p>
      </div>

      <figure className="flex flex-col gap-2">
        <div
          aria-hidden="true"
          className="flex h-32 items-end gap-1.5 border-b border-border"
        >
          {values.map((value, index) => (
            <div
              key={labels[range][index]}
              className="flex-1 rounded-t-sm bg-chart-1 transition-[height] duration-300 ease-out"
              style={{ height: `${(value / max) * 100}%` }}
            />
          ))}
        </div>
        <div aria-hidden="true" className="flex gap-1.5">
          {labels[range].map((label) => (
            <span
              key={label}
              className="flex-1 text-center text-[0.7rem] text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
        <figcaption className="sr-only">
          {metricLabels[metric]} by period:{" "}
          {values
            .map(
              (value, index) =>
                `${labels[range][index]} ${numberFormat.format(value)}`,
            )
            .join(", ")}
        </figcaption>
      </figure>
    </section>
  );
}
