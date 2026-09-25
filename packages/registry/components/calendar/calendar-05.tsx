"use client";

import * as React from "react";

import { Calendar } from "@/registry/base/ui/calendar";

// The "today" of this example, pinned so the preview never drifts.
const today = new Date(2026, 8, 25);

const booked = [
  new Date(2026, 8, 29),
  new Date(2026, 8, 30),
  new Date(2026, 9, 6),
  new Date(2026, 9, 7),
  new Date(2026, 9, 13),
  new Date(2026, 9, 21),
  new Date(2026, 9, 22),
];

// Each legend sample mirrors how that state renders in the grid.
const legend = [
  { label: "Available", sample: "text-foreground" },
  {
    label: "Booked",
    sample:
      "bg-destructive/10 text-destructive line-through dark:bg-destructive/20",
  },
  { label: "Closed", sample: "text-muted-foreground opacity-50" },
];

export default function Calendar05() {
  const [date, setDate] = React.useState<Date | undefined>();

  return (
    <div className="flex w-full max-w-fit flex-col gap-3 rounded-xl border bg-background p-3 shadow-sm">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={new Date(2026, 9, 1)}
        startMonth={new Date(2026, 8, 1)}
        endMonth={new Date(2026, 11, 1)}
        disabled={[{ before: today }, { dayOfWeek: [0, 6] }, ...booked]}
        modifiers={{ booked }}
        modifiersClassNames={{
          booked:
            "opacity-100! [&>button]:bg-destructive/10 [&>button]:text-destructive [&>button]:line-through [&>button]:opacity-100! dark:[&>button]:bg-destructive/20",
        }}
        className="mx-auto p-0 [--cell-size:--spacing(8)]"
      />
      <ul
        aria-label="Legend"
        className="flex flex-wrap gap-x-4 gap-y-1.5 border-t px-1 pt-3 text-xs text-muted-foreground"
      >
        {legend.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`inline-flex size-5 items-center justify-center rounded-sm text-[0.7rem] tabular-nums ${item.sample}`}
            >
              14
            </span>
            {item.label}
          </li>
        ))}
      </ul>
      <p className="px-1 text-sm" aria-live="polite">
        {date ? (
          <>
            Slot held for{" "}
            <span className="font-medium">
              {date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">
            Weekdays only. Booked dates are struck through.
          </span>
        )}
      </p>
    </div>
  );
}
