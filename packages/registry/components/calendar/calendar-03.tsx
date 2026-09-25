"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";

const MAX_DAYS = 4;

const chipFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const initialDays = [new Date(2026, 9, 7), new Date(2026, 9, 14)];

export default function Calendar03() {
  const [days, setDays] = React.useState<Date[] | undefined>(initialDays);
  const selected = [...(days ?? [])].sort((a, b) => a.getTime() - b.getTime());
  const atLimit = selected.length >= MAX_DAYS;

  return (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-xl border bg-background p-3 shadow-sm">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <h3 id="calendar-03-title" className="text-sm font-medium">
          Office days in October
        </h3>
        <span
          className="text-xs text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {selected.length} of {MAX_DAYS}
        </span>
      </div>
      <Calendar
        aria-labelledby="calendar-03-title"
        mode="multiple"
        max={MAX_DAYS}
        selected={days}
        onSelect={setDays}
        // At the limit react-day-picker would replace the whole selection with
        // the clicked day, so lock the unpicked days until one is removed.
        disabled={
          atLimit
            ? (day) => !selected.some((d) => d.getTime() === day.getTime())
            : undefined
        }
        defaultMonth={new Date(2026, 9, 1)}
        disableNavigation
        hideNavigation
        showOutsideDays={false}
        className="w-full p-0 [--cell-size:--spacing(8)]"
        classNames={{ root: "w-full" }}
      />
      {atLimit ? (
        <p className="px-1 text-xs text-muted-foreground">
          Limit reached. Remove a day to pick another.
        </p>
      ) : null}
      <div className="flex min-h-7 flex-wrap items-center gap-1.5 border-t pt-3">
        {selected.length === 0 ? (
          <span className="px-1 text-sm text-muted-foreground">
            Remote all month.
          </span>
        ) : (
          selected.map((day) => (
            <Badge
              key={day.toISOString()}
              variant="secondary"
              className="h-6 gap-0.5 pr-0.5"
            >
              {chipFormatter.format(day)}
              <button
                type="button"
                aria-label={`Remove ${chipFormatter.format(day)}`}
                onClick={() =>
                  setDays(selected.filter((d) => d.getTime() !== day.getTime()))
                }
                className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon aria-hidden="true" className="size-3" />
              </button>
            </Badge>
          ))
        )}
        {selected.length > 0 ? (
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto"
            onClick={() => setDays([])}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
