"use client";

import * as React from "react";

import { Calendar, CalendarDayButton } from "@/registry/base/ui/calendar";

type Category = "deploy" | "review" | "incident";

const categories: { value: Category; label: string; dot: string }[] = [
  { value: "deploy", label: "Deploy", dot: "bg-chart-1" },
  { value: "review", label: "Review", dot: "bg-chart-2" },
  { value: "incident", label: "Incident", dot: "bg-destructive" },
];

// Day of month (August 2026) -> categories happening that day.
const events: Record<number, Category[]> = {
  3: ["deploy"],
  5: ["review"],
  10: ["deploy", "review"],
  12: ["incident"],
  13: ["review", "incident"],
  17: ["deploy"],
  19: ["review"],
  24: ["deploy", "review", "incident"],
  27: ["deploy"],
};

const dotClass = Object.fromEntries(
  categories.map((item) => [item.value, item.dot]),
) as Record<Category, string>;

function eventsFor(date: Date) {
  if (date.getFullYear() !== 2026 || date.getMonth() !== 7) return [];
  return events[date.getDate()] ?? [];
}

function EventDayButton({
  children,
  day,
  ...props
}: React.ComponentProps<typeof CalendarDayButton>) {
  const dayEvents = eventsFor(day.date);

  return (
    <CalendarDayButton day={day} {...props}>
      {children}
      <span aria-hidden="true" className="flex h-1 items-center gap-0.5">
        {dayEvents.map((category) => (
          <span
            key={category}
            className={`size-1 rounded-full ${dotClass[category]} in-data-[selected-single=true]:bg-primary-foreground`}
          />
        ))}
      </span>
    </CalendarDayButton>
  );
}

export default function Calendar07() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 7, 24),
  );
  const selectedEvents = date ? eventsFor(date) : [];

  return (
    <div className="flex w-full max-w-fit flex-col gap-3 rounded-xl border bg-background p-2 shadow-sm sm:p-3">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={new Date(2026, 7, 1)}
        showOutsideDays={false}
        className="p-0 [--cell-size:--spacing(7)] sm:[--cell-size:--spacing(9)]"
        components={{ DayButton: EventDayButton }}
        labels={{
          labelDayButton: (day, modifiers) => {
            const count = eventsFor(day).length;
            const base = day.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            const suffix =
              count > 0 ? `, ${count} ${count === 1 ? "event" : "events"}` : "";
            return `${modifiers.selected ? "Selected, " : ""}${base}${suffix}`;
          },
        }}
      />
      <ul
        aria-label="Event types"
        className="flex flex-wrap gap-x-4 gap-y-1.5 border-t px-1 pt-3 text-xs text-muted-foreground"
      >
        {categories.map((item) => (
          <li key={item.value} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${item.dot}`}
            />
            {item.label}
          </li>
        ))}
      </ul>
      <p className="px-1 text-sm" aria-live="polite">
        {date ? (
          <>
            <span className="font-medium">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>{" "}
            <span className="text-muted-foreground">
              {selectedEvents.length > 0
                ? selectedEvents
                    .map(
                      (value) =>
                        categories.find((item) => item.value === value)?.label,
                    )
                    .join(", ")
                : "Nothing scheduled"}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">
            Pick a day to see what shipped.
          </span>
        )}
      </p>
    </div>
  );
}
