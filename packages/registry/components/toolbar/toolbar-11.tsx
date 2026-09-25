"use client";

import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Toggle } from "@/registry/base/ui/toggle";
import { ToggleGroup } from "@/registry/base/ui/toggle-group";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

type Meeting = {
  mine: boolean;
  day: string;
  date: string;
  time: string;
  title: string;
  tone: "chart-1" | "chart-2" | "chart-3";
};

const weeks: { label: string; short: string; events: Meeting[] }[] = [
  {
    label: "September 15 – 21, 2026",
    short: "Sep 15 – 21",
    events: [
      {
        day: "Tue",
        date: "16",
        time: "10:00",
        title: "Sprint planning",
        mine: true,
        tone: "chart-1",
      },
      {
        day: "Thu",
        date: "18",
        time: "14:30",
        title: "Design critique: checkout",
        mine: true,
        tone: "chart-2",
      },
    ],
  },
  {
    label: "September 22 – 28, 2026",
    short: "Sep 22 – 28",
    events: [
      {
        day: "Mon",
        date: "22",
        time: "09:30",
        title: "Weekly sync with Northwind",
        mine: true,
        tone: "chart-1",
      },
      {
        day: "Wed",
        date: "24",
        time: "13:00",
        title: "Interview: Senior iOS engineer",
        mine: false,
        tone: "chart-3",
      },
      {
        day: "Fri",
        date: "26",
        time: "16:00",
        title: "Release 4.2 go/no-go",
        mine: true,
        tone: "chart-2",
      },
    ],
  },
  {
    label: "Sep 29 – Oct 5, 2026",
    short: "Sep 29 – Oct 5",
    events: [
      {
        day: "Tue",
        date: "30",
        time: "11:00",
        title: "Quarterly business review",
        tone: "chart-1",
        mine: false,
      },
    ],
  },
];

const CURRENT_WEEK = 1;

const toneClass = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
};

export default function Toolbar11() {
  const [week, setWeek] = useState(CURRENT_WEEK);
  const [scope, setScope] = useState("mine");

  const current = weeks[week];
  const events =
    scope === "mine"
      ? current.events.filter((event) => event.mine)
      : current.events;

  return (
    <section
      aria-label="Schedule"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-xs"
    >
      <Toolbar
        aria-label="Calendar navigation"
        className="w-full flex-wrap rounded-t-xl rounded-b-none border-0 border-b bg-transparent px-2 py-2 shadow-none"
      >
        <ToolbarButton
          disabled={week === CURRENT_WEEK}
          onClick={() => setWeek(CURRENT_WEEK)}
          className="border border-input"
        >
          Today
        </ToolbarButton>
        <ToolbarGroup aria-label="Change week">
          <ToolbarButton
            aria-label="Previous week"
            disabled={week === 0}
            onClick={() => setWeek((value) => value - 1)}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            aria-label="Next week"
            disabled={week === weeks.length - 1}
            onClick={() => setWeek((value) => value + 1)}
          >
            <ChevronRightIcon aria-hidden="true" />
          </ToolbarButton>
        </ToolbarGroup>
        <h3
          aria-live="polite"
          className="min-w-0 flex-1 basis-24 truncate px-1 text-sm font-semibold"
        >
          <span className="sm:hidden">{current.short}</span>
          <span className="hidden sm:inline">{current.label}</span>
        </h3>
        <ToolbarSeparator className="hidden sm:block" />
        <ToggleGroup
          aria-label="Whose events"
          value={[scope]}
          onValueChange={(value) => {
            if (value.length > 0) setScope(value[0] as string);
          }}
        >
          <ToolbarButton render={<Toggle size="sm" />} value="mine">
            Mine
          </ToolbarButton>
          <ToolbarButton render={<Toggle size="sm" />} value="team">
            Team
          </ToolbarButton>
        </ToggleGroup>
      </Toolbar>

      {events.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Nothing on your calendar this week. Switch to Team to see everyone’s meetings.
        </p>
      ) : (
        <ol className="flex flex-col gap-1 p-2">
          {events.map((event) => (
            <li
              key={event.title}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
            >
              <div className="flex w-9 shrink-0 flex-col items-center leading-none">
                <span className="text-[0.7rem] text-muted-foreground uppercase">
                  {event.day}
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {event.date}
                </span>
              </div>
              <span
                aria-hidden="true"
                className={`h-8 w-1 shrink-0 rounded-full ${toneClass[event.tone]}`}
              />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {event.title}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {event.time} · 45 min
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
        >
          <PlusIcon aria-hidden="true" />
          Schedule a meeting
        </Button>
      </div>
    </section>
  );
}
