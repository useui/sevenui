"use client";

import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";

type CalendarEvent = {
  title: string;
  start: number; // hours from 9:00
  length: number; // hours
  video?: boolean;
};

const days: { label: string; short: string; events: CalendarEvent[] }[] = [
  {
    label: "Wednesday, September 23",
    short: "Wed, Sep 23",
    events: [
      { title: "Design critique", start: 0.5, length: 1, video: true },
      { title: "Lunch with Ines", start: 3, length: 1 },
      { title: "Roadmap review", start: 5, length: 1.5, video: true },
    ],
  },
  {
    label: "Thursday, September 24",
    short: "Thu, Sep 24",
    events: [
      { title: "Standup", start: 0, length: 0.5, video: true },
      { title: "Interview: Senior iOS", start: 1.5, length: 1, video: true },
      { title: "Focus time", start: 4, length: 2 },
    ],
  },
  {
    label: "Friday, September 25",
    short: "Fri, Sep 25",
    events: [
      { title: "Customer call: Arden", start: 1, length: 0.5, video: true },
      { title: "Sprint demo", start: 6, length: 1, video: true },
    ],
  },
];

const hours = [
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
];
const HOUR = 44; // px per hour row

// Neutral placeholder blocks; real slots are unknown until the day loads.
const placeholders = [
  { id: "p1", top: 0.5, height: 1, width: "w-3/4" },
  { id: "p2", top: 2.5, height: 1.5, width: "w-2/3" },
  { id: "p3", top: 5, height: 1, width: "w-4/5" },
];

function formatTime(offset: number) {
  const total = 9 * 60 + offset * 60;
  const hour24 = Math.floor(total / 60);
  const minutes = total % 60;
  const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
  return `${hour12}:${minutes.toString().padStart(2, "0")}`;
}

export default function Skeleton15() {
  const [dayIndex, setDayIndex] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 1000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const day = days[dayIndex];

  function go(step: number) {
    setDayIndex((index) => index + step);
    setLoading(true);
  }

  return (
    <section
      aria-label="Day schedule"
      className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous day"
          disabled={dayIndex === 0}
          onClick={() => go(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <h3 className="text-sm font-semibold" aria-live="polite">
          <span className="sm:hidden">{day.short}</span>
          <span className="hidden sm:inline">{day.label}</span>
        </h3>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next day"
          disabled={dayIndex === days.length - 1}
          onClick={() => go(1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </header>

      <p role="status" className="sr-only">
        {loading ? "Loading events" : `${day.events.length} events`}
      </p>

      <div className="flex p-3">
        <ol
          aria-hidden="true"
          className="relative w-12 shrink-0"
          style={{ height: HOUR * hours.length }}
        >
          {hours.map((hour, index) => (
            <li
              key={hour}
              className="absolute left-0 text-[11px] leading-none text-muted-foreground tabular-nums"
              style={{ top: index === 0 ? 0 : index * HOUR - 5 }}
            >
              {hour}
            </li>
          ))}
        </ol>

        <div
          aria-busy={loading}
          className="relative flex-1 border-l border-border"
          style={{ height: HOUR * hours.length }}
        >
          {hours.map((hour, index) => (
            <div
              key={hour}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-border/60"
              style={{ top: index * HOUR }}
            />
          ))}

          {loading ? (
            <div aria-hidden="true">
              {placeholders.map((block) => (
                <Skeleton
                  key={block.id}
                  className={`absolute left-2 rounded-lg ${block.width}`}
                  style={{
                    top: block.top * HOUR + 2,
                    height: block.height * HOUR - 4,
                  }}
                />
              ))}
            </div>
          ) : (
            <ul>
              {day.events.map((event) => (
                <li
                  key={event.title}
                  className="absolute inset-x-2 flex flex-col justify-center overflow-hidden rounded-lg bg-card bg-linear-to-r from-chart-2/15 to-chart-2/15 px-2.5 text-foreground ring-1 ring-chart-2/30 ring-inset"
                  style={{
                    top: event.start * HOUR + 2,
                    height: event.length * HOUR - 4,
                  }}
                >
                  <p className="flex items-center gap-1.5 truncate text-xs font-medium">
                    {event.video ? (
                      <>
                        <Video aria-hidden="true" className="size-3 shrink-0" />
                        <span className="sr-only">Video call:</span>
                      </>
                    ) : null}
                    <span className="truncate">{event.title}</span>
                  </p>
                  {event.length >= 1 ? (
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {formatTime(event.start)} –{" "}
                      {formatTime(event.start + event.length)}
                    </p>
                  ) : (
                    <span className="sr-only">
                      {formatTime(event.start)} to{" "}
                      {formatTime(event.start + event.length)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
