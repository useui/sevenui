"use client";

import * as React from "react";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

// Reporting runs up to yesterday; "today" is pinned so the sample is stable.
const today = new Date(2026, 9, 5);
const dataStart = new Date(2026, 0, 1);
const dayMs = 86_400_000;

function daysAgo(count: number) {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - count);
}

const presets: { label: string; range: () => DateRange }[] = [
  { label: "Yesterday", range: () => ({ from: daysAgo(1), to: daysAgo(1) }) },
  { label: "Last 7 days", range: () => ({ from: daysAgo(7), to: daysAgo(1) }) },
  {
    label: "Last 30 days",
    range: () => ({ from: daysAgo(30), to: daysAgo(1) }),
  },
  {
    label: "Last month",
    range: () => ({
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
    }),
  },
  {
    label: "Quarter to date",
    range: () => ({ from: new Date(2026, 9, 1), to: daysAgo(1) }),
  },
];

// Deterministic daily trial signups for any date.
function signupsOn(date: Date) {
  const n = Math.round(date.getTime() / dayMs);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  return (weekend ? 22 : 41) + ((n * 37) % 19);
}

function summarize(range: DateRange | undefined) {
  if (!range?.from) return null;
  const to = range.to ?? range.from;
  const length = Math.round((to.getTime() - range.from.getTime()) / dayMs) + 1;
  let total = 0;
  let previous = 0;
  for (let i = 0; i < length; i += 1) {
    total += signupsOn(new Date(range.from.getTime() + i * dayMs));
    previous += signupsOn(
      new Date(range.from.getTime() - (length - i) * dayMs),
    );
  }
  return {
    total,
    length,
    average: Math.round(total / length),
    change: previous ? ((total - previous) / previous) * 100 : 0,
  };
}

function formatRange(range: DateRange | undefined) {
  if (!range?.from) return "Pick a date range";
  const short = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (!range.to || range.to.getTime() === range.from.getTime()) {
    return short(range.from);
  }
  return `${short(range.from)} – ${short(range.to)}`;
}

export default function Calendar12() {
  const [applied, setApplied] = React.useState<DateRange | undefined>(
    presets[2].range(),
  );
  const [draft, setDraft] = React.useState<DateRange | undefined>(applied);
  const [open, setOpen] = React.useState(false);
  // Controlled so a quick range brings its last month into view.
  const [month, setMonth] = React.useState<Date>(applied?.to ?? today);
  const stats = summarize(applied);
  const activePreset = presets.find((preset) => {
    const range = preset.range();
    return (
      draft?.from?.getTime() === range.from?.getTime() &&
      draft?.to?.getTime() === range.to?.getTime()
    );
  });

  return (
    <section
      aria-labelledby="calendar-12-title"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="calendar-12-title" className="text-sm font-medium">
          Trial signups
        </h3>
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (next) {
              setDraft(applied);
              setMonth(applied?.to ?? today);
            }
          }}
        >
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                aria-label={`Reporting period: ${formatRange(applied)}`}
              />
            }
          >
            <CalendarIcon aria-hidden="true" data-icon="inline-start" />
            <span className="tabular-nums">{formatRange(applied)}</span>
            <ChevronDownIcon aria-hidden="true" data-icon="inline-end" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-auto max-w-[calc(100vw-2rem)] gap-0 p-0"
          >
            <div className="flex flex-col sm:flex-row">
              <fieldset
                aria-label="Quick ranges"
                className="flex min-w-0 gap-1 overflow-x-auto border-b p-2 sm:w-36 sm:flex-col sm:border-r sm:border-b-0"
              >
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={
                      activePreset?.label === preset.label
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    aria-pressed={activePreset?.label === preset.label}
                    className="shrink-0 justify-start"
                    onClick={() => {
                      const range = preset.range();
                      setDraft(range);
                      setMonth(range.to ?? range.from ?? today);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </fieldset>
              <Calendar
                mode="range"
                selected={draft}
                onSelect={setDraft}
                month={month}
                onMonthChange={setMonth}
                startMonth={dataStart}
                endMonth={today}
                disabled={[{ before: dataStart }, { after: daysAgo(1) }]}
                className="mx-auto p-3"
              />
            </div>
            <div className="flex items-center justify-between gap-2 border-t p-2">
              <span className="pl-1 text-xs text-muted-foreground tabular-nums">
                {formatRange(draft)}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!draft?.from}
                  onClick={() => {
                    setApplied(draft);
                    setOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {stats ? (
        <div aria-live="polite" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-3xl font-semibold tabular-nums">
              {stats.total.toLocaleString("en-US")}
            </span>
            <span
              className={
                stats.change >= 0
                  ? "text-sm font-medium text-success tabular-nums"
                  : "text-sm font-medium text-destructive tabular-nums"
              }
            >
              {stats.change >= 0 ? "+" : ""}
              {stats.change.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">
              vs. previous {stats.length} {stats.length === 1 ? "day" : "days"}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t pt-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Daily average</dt>
              <dd className="font-medium tabular-nums">{stats.average}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-muted-foreground">Trial-to-paid</dt>
              <dd className="font-medium tabular-nums">
                {Math.round(stats.total * 0.184).toLocaleString("en-US")}{" "}
                <span className="text-muted-foreground">(18.4%)</span>
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}
