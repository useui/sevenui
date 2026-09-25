"use client";

import * as React from "react";
import { ArrowRightIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";

const DAY_MS = 24 * 60 * 60 * 1000;

const shortFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

// A holiday promo that runs across the November-December boundary.
const initialRange: DateRange = {
  from: new Date(2026, 10, 23),
  to: new Date(2026, 11, 6),
};

export default function Calendar04() {
  const [range, setRange] = React.useState<DateRange | undefined>(
    initialRange,
  );

  // Both the start and the end day are part of the campaign.
  const days =
    range?.from && range?.to
      ? Math.round((range.to.getTime() - range.from.getTime()) / DAY_MS) + 1
      : 0;

  return (
    <div className="w-full max-w-fit overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium tabular-nums">
          <span className={range?.from ? "" : "text-muted-foreground"}>
            {range?.from ? shortFormatter.format(range.from) : "Start"}
          </span>
          <ArrowRightIcon
            aria-hidden="true"
            className="size-3.5 text-muted-foreground"
          />
          <span className={range?.to ? "" : "text-muted-foreground"}>
            {range?.to ? shortFormatter.format(range.to) : "End"}
          </span>
        </div>
        <span
          className="text-sm text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {days > 0
            ? `Holiday promo runs ${days} ${days === 1 ? "day" : "days"}`
            : "Pick the first and last day of the promo"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          disabled={!range?.from}
          onClick={() => setRange(undefined)}
        >
          Clear
        </Button>
      </div>
      <Calendar
        mode="range"
        numberOfMonths={2}
        selected={range}
        onSelect={setRange}
        defaultMonth={new Date(2026, 10, 1)}
        showOutsideDays={false}
        className="mx-auto p-3"
      />
    </div>
  );
}
