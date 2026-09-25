"use client";

import { Video } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";

type AgendaEvent = {
  title: string;
  start: number;
  end: number;
  where: string;
  video?: boolean;
};

type AgendaDay = {
  key: string;
  label: string;
  date: string;
  now: number;
  events: AgendaEvent[];
};

// Minutes since midnight keep the "now" comparison simple.
const at = (hours: number, minutes = 0) => hours * 60 + minutes;

const days: AgendaDay[] = [
  {
    key: "mon",
    label: "Mon",
    date: "Monday, October 6",
    now: at(11, 40),
    events: [
      {
        title: "Design standup",
        start: at(9, 30),
        end: at(9, 45),
        where: "Studio room",
        video: false,
      },
      {
        title: "Checkout review with Finance",
        start: at(10, 30),
        end: at(11, 15),
        where: "Google Meet",
        video: true,
      },
      {
        title: "Lunch with Aiko",
        start: at(12, 30),
        end: at(13, 30),
        where: "Café Lumen",
      },
      {
        title: "Interview: Senior engineer",
        start: at(15),
        end: at(16),
        where: "Zoom",
        video: true,
      },
    ],
  },
  {
    key: "tue",
    label: "Tue",
    date: "Tuesday, October 7",
    now: at(8, 10),
    events: [
      {
        title: "Roadmap planning",
        start: at(10),
        end: at(11, 30),
        where: "Boardroom",
      },
      {
        title: "1:1 with Marcus",
        start: at(14),
        end: at(14, 30),
        where: "Google Meet",
        video: true,
      },
    ],
  },
  {
    key: "wed",
    label: "Wed",
    date: "Wednesday, October 8",
    now: at(17, 5),
    events: [
      {
        title: "Customer call: Harbor Labs",
        start: at(9),
        end: at(9, 45),
        where: "Zoom",
        video: true,
      },
      {
        title: "Sprint demo",
        start: at(16),
        end: at(17),
        where: "All-hands room",
      },
    ],
  },
];

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${mins.toString().padStart(2, "0")} ${suffix}`;
}

function NowIndicator({ minutes }: { minutes: number }) {
  return (
    <li className="flex items-center gap-2 py-1">
      <span className="w-16 shrink-0 text-right text-xs font-medium text-destructive tabular-nums">
        {formatTime(minutes)}
      </span>
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-destructive" />
      <Separator aria-label="Current time" className="flex-1 bg-destructive" />
    </li>
  );
}

export default function Separator11() {
  const [dayKey, setDayKey] = React.useState(days[0].key);
  const day = days.find((item) => item.key === dayKey) ?? days[0];
  const nowIndex = day.events.findIndex((event) => event.start > day.now);
  const insertAt = nowIndex === -1 ? day.events.length : nowIndex;

  return (
    <section
      aria-labelledby="separator-11-heading"
      className="w-full max-w-sm rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <div className="min-w-0">
          <h3 id="separator-11-heading" className="text-sm font-medium">
            Agenda
          </h3>
          <p className="truncate text-xs text-muted-foreground" aria-live="polite">
            {day.date}
          </p>
        </div>
        <fieldset className="flex min-w-0 gap-1">
          <legend className="sr-only">Choose day</legend>
          {days.map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={item.key === dayKey ? "secondary" : "ghost"}
              aria-pressed={item.key === dayKey}
              onClick={() => setDayKey(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </fieldset>
      </header>
      <Separator />

      <ol className="flex flex-col gap-1 p-3">
        {day.events.map((event, index) => {
          const past = event.end <= day.now;
          const current = event.start <= day.now && event.end > day.now;
          return (
            <React.Fragment key={event.title}>
              {index === insertAt ? <NowIndicator minutes={day.now} /> : null}
              <li
                className={
                  past
                    ? "flex items-stretch gap-2 rounded-md px-1 py-2 opacity-60"
                    : "flex items-stretch gap-2 rounded-md px-1 py-2"
                }
              >
                <span className="w-16 shrink-0 pt-0.5 text-right text-xs text-muted-foreground tabular-nums">
                  {formatTime(event.start)}
                </span>
                <Separator
                  orientation="vertical"
                  className={
                    current
                      ? "rounded-full bg-primary data-[orientation=vertical]:w-0.5"
                      : "rounded-full bg-chart-2 data-[orientation=vertical]:w-0.5"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-pretty">{event.title}</p>
                  <p className="flex items-start gap-1 text-xs text-muted-foreground">
                    {event.video ? (
                      <Video aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
                    ) : null}
                    <span>
                      {formatTime(event.start)} to {formatTime(event.end)} ·{" "}
                      {event.where}
                    </span>
                  </p>
                </div>
              </li>
            </React.Fragment>
          );
        })}
        {insertAt === day.events.length ? (
          <NowIndicator minutes={day.now} />
        ) : null}
      </ol>
    </section>
  );
}
