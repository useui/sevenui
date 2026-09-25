"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { ButtonGroup } from "@/registry/base/ui/button-group";

type View = "day" | "week" | "month";

const views: { value: View; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

// Fixed "today" so the sample agenda always has something to show.
const today = new Date(2026, 8, 24);

const events = [
  { date: new Date(2026, 8, 22, 9, 30), title: "Sprint planning", calendar: "chart-1" },
  { date: new Date(2026, 8, 24, 11, 0), title: "Design review: onboarding", calendar: "chart-2" },
  { date: new Date(2026, 8, 24, 15, 30), title: "1:1 with Dana", calendar: "chart-3" },
  { date: new Date(2026, 8, 26, 10, 0), title: "Customer call — Northwind", calendar: "chart-1" },
  { date: new Date(2026, 9, 1, 14, 0), title: "Quarterly business review", calendar: "chart-4" },
  { date: new Date(2026, 9, 8, 16, 0), title: "Security training", calendar: "chart-2" },
];

const dotClass: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
};

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function getRange(anchor: Date, view: View): [Date, Date] {
  if (view === "day") {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
    return [start, new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)];
  }
  if (view === "week") {
    const start = startOfWeek(anchor);
    return [start, new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)];
  }
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  return [start, new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)];
}

function shift(anchor: Date, view: View, step: number) {
  const next = new Date(anchor);
  if (view === "day") next.setDate(next.getDate() + step);
  if (view === "week") next.setDate(next.getDate() + step * 7);
  if (view === "month") next.setMonth(next.getMonth() + step, 1);
  return next;
}

const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const shortFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function formatTitle(start: Date, end: Date, view: View) {
  if (view === "day") return dayFormat.format(start);
  if (view === "month") return monthFormat.format(start);
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
  return `${shortFormat.format(start)} – ${shortFormat.format(last)}`;
}

export default function ButtonGroup11() {
  const [view, setView] = useState<View>("week");
  const [anchor, setAnchor] = useState(today);
  const [start, end] = getRange(anchor, view);
  const visible = events.filter((event) => event.date >= start && event.date < end);

  return (
    <div className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
        <div className="flex items-center gap-2">
          <ButtonGroup aria-label="Change period">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Previous ${view}`}
              onClick={() => setAnchor((a) => shift(a, view, -1))}
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnchor(today)}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Next ${view}`}
              onClick={() => setAnchor((a) => shift(a, view, 1))}
            >
              <ChevronRightIcon aria-hidden="true" />
            </Button>
          </ButtonGroup>
          <h3 className="text-sm font-medium tabular-nums" aria-live="polite">
            {formatTitle(start, end, view)}
          </h3>
        </div>
        <ButtonGroup aria-label="Calendar view">
          {views.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              aria-pressed={view === option.value}
              onClick={() => setView(option.value)}
              className="text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground dark:aria-pressed:bg-input/60"
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      {visible.length > 0 ? (
        <ul className="flex flex-col gap-1 p-2">
          {visible.map((event) => (
            <li
              key={event.title}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
            >
              <span
                className={`size-2 shrink-0 rounded-full ${dotClass[event.calendar]}`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm">{event.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {view === "day"
                  ? timeFormat.format(event.date)
                  : `${shortFormat.format(event.date)}, ${timeFormat.format(event.date)}`}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing scheduled. Enjoy the focus time.
        </p>
      )}
    </div>
  );
}
