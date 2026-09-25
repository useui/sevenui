"use client";

import * as React from "react";

import { Toggle } from "@/registry/base/ui/toggle";

const series = [
  { key: "organic", label: "Organic", swatch: "bg-chart-1" },
  { key: "paid", label: "Paid", swatch: "bg-chart-2" },
  { key: "referral", label: "Referral", swatch: "bg-chart-3" },
] as const;

type SeriesKey = (typeof series)[number]["key"];

const months: { month: string; values: Record<SeriesKey, number> }[] = [
  { month: "Apr", values: { organic: 1840, paid: 920, referral: 410 } },
  { month: "May", values: { organic: 2120, paid: 1040, referral: 380 } },
  { month: "Jun", values: { organic: 1960, paid: 1310, referral: 520 } },
  { month: "Jul", values: { organic: 2380, paid: 1180, referral: 610 } },
  { month: "Aug", values: { organic: 2710, paid: 990, referral: 690 } },
  { month: "Sep", values: { organic: 2940, paid: 1420, referral: 760 } },
];

export default function Toggle12() {
  const [visible, setVisible] = React.useState<Set<SeriesKey>>(
    () => new Set(["organic", "paid", "referral"]),
  );
  const legendId = React.useId();

  function setSeries(key: SeriesKey, pressed: boolean) {
    setVisible((current) => {
      const next = new Set(current);
      if (pressed) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  const shown = series.filter((s) => visible.has(s.key));
  const totals = months.map((m) =>
    shown.reduce((sum, s) => sum + m.values[s.key], 0),
  );
  const max = Math.max(...totals, 1);
  const latest = totals[totals.length - 1];
  const previous = totals[totals.length - 2];
  const change = previous ? ((latest - previous) / previous) * 100 : 0;

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm text-muted-foreground">Signups by channel</h3>
          <p className="text-2xl font-semibold tabular-nums">
            {latest.toLocaleString("en-US")}
          </p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          <span className="font-medium text-foreground">
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>{" "}
          vs. August
        </p>
      </div>
      <fieldset
        aria-labelledby={legendId}
        className="flex min-w-0 flex-wrap items-center gap-1.5"
      >
        <span id={legendId} className="sr-only">
          Show channels
        </span>
        {series.map((s) => {
          const isOn = visible.has(s.key);
          return (
            <Toggle
              key={s.key}
              size="sm"
              variant="outline"
              pressed={isOn}
              disabled={isOn && visible.size === 1}
              onPressedChange={(pressed) => setSeries(s.key, pressed)}
              className="text-muted-foreground aria-pressed:bg-transparent aria-pressed:text-foreground"
            >
              <span
                aria-hidden="true"
                className={`size-2.5 rounded-[3px] ${s.swatch} opacity-30 group-aria-pressed/toggle:opacity-100`}
              />
              {s.label}
            </Toggle>
          );
        })}
      </fieldset>
      <div
        role="img"
        aria-label={`Monthly signups from April to September for ${shown
          .map((s) => s.label.toLowerCase())
          .join(", ")}`}
        className="flex h-40 items-end gap-2 sm:gap-3"
      >
        {months.map((m, index) => (
          <div
            key={m.month}
            className="flex h-full flex-1 flex-col items-center gap-1.5"
          >
            <div className="flex w-full flex-1 flex-col-reverse overflow-hidden">
              <div
                className="flex w-full flex-col-reverse gap-px overflow-hidden rounded-t-sm transition-[height] duration-300 ease-out"
                style={{ height: `${(totals[index] / max) * 100}%` }}
              >
                {shown.map((s) => (
                  <div
                    key={s.key}
                    className={s.swatch}
                    style={{ flexGrow: m.values[s.key] }}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{m.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
