"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

type CalendarId = "work" | "personal" | "team";

type CalendarEvent = {
  id: number;
  title: string;
  day: string;
  time: string;
  calendar: CalendarId;
};

const calendars: { id: CalendarId; name: string; dot: string }[] = [
  { id: "work", name: "Work", dot: "bg-chart-1" },
  { id: "team", name: "Team rituals", dot: "bg-chart-2" },
  { id: "personal", name: "Personal", dot: "bg-chart-3" },
];

// Monday of the week the calendar opens on.
const firstMonday = new Date(2025, 8, 29);

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayLabel(date: Date) {
  return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.getDate()}`;
}

function shortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const initialEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Sprint planning",
    day: "2025-09-29",
    time: "09:30",
    calendar: "team",
  },
  {
    id: 2,
    title: "Pricing page review",
    day: "2025-09-29",
    time: "14:00",
    calendar: "work",
  },
  {
    id: 3,
    title: "Dentist",
    day: "2025-09-30",
    time: "08:15",
    calendar: "personal",
  },
  {
    id: 4,
    title: "Customer call: Acme",
    day: "2025-09-30",
    time: "16:00",
    calendar: "work",
  },
  {
    id: 5,
    title: "Design critique",
    day: "2025-10-01",
    time: "11:00",
    calendar: "team",
  },
  {
    id: 6,
    title: "Q4 roadmap draft due",
    day: "2025-10-03",
    time: "12:00",
    calendar: "work",
  },
  {
    id: 7,
    title: "Trail run with Sam",
    day: "2025-10-04",
    time: "07:30",
    calendar: "personal",
  },
];

const triggerClass = "focus-visible:ring-2 focus-visible:ring-ring/50";

export default function Menubar12() {
  const [events, setEvents] = React.useState(initialEvents);
  const [view, setView] = React.useState("week");
  const [enabled, setEnabled] = React.useState<Record<CalendarId, boolean>>({
    work: true,
    team: true,
    personal: true,
  });
  const [showWeekend, setShowWeekend] = React.useState(false);
  const [weekOffset, setWeekOffset] = React.useState(0);

  const weekStart = addDays(firstMonday, weekOffset * 7);
  const dayCount = view === "day" ? 1 : showWeekend ? 7 : 5;
  const shownDays = Array.from({ length: dayCount }, (_, index) =>
    addDays(weekStart, index),
  );
  const weekEnd = shownDays[shownDays.length - 1];
  const dotFor = (id: CalendarId) =>
    calendars.find((calendar) => calendar.id === id)?.dot;

  function addEvent(calendar: CalendarId, title: string) {
    setEvents((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        day: dayKey(weekStart),
        time: "17:00",
        calendar,
      },
    ]);
  }

  return (
    <section
      aria-labelledby="menubar-12-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <Menubar aria-label="Calendar">
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Event</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => addEvent("work", "Focus block")}>
                New focus block
                <MenubarShortcut>⌘E</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => addEvent("team", "1:1 with Priya")}>
                Schedule 1:1
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                disabled={events.length === initialEvents.length}
                onClick={() => setEvents(initialEvents)}
              >
                Undo added events
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Calendars</MenubarTrigger>
            <MenubarContent className="min-w-44">
              <MenubarGroup>
                <MenubarLabel>Show on grid</MenubarLabel>
                {calendars.map((calendar) => (
                  <MenubarCheckboxItem
                    key={calendar.id}
                    checked={enabled[calendar.id]}
                    onCheckedChange={(checked) =>
                      setEnabled((current) => ({
                        ...current,
                        [calendar.id]: checked,
                      }))
                    }
                  >
                    <span
                      className={`size-2 rounded-full ${calendar.dot}`}
                      aria-hidden="true"
                    />
                    {calendar.name}
                  </MenubarCheckboxItem>
                ))}
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>View</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={view} onValueChange={setView}>
                <MenubarRadioItem value="day">
                  Day
                  <MenubarShortcut>D</MenubarShortcut>
                </MenubarRadioItem>
                <MenubarRadioItem value="week">
                  Work week
                  <MenubarShortcut>W</MenubarShortcut>
                </MenubarRadioItem>
              </MenubarRadioGroup>
              <MenubarSeparator />
              <MenubarCheckboxItem
                checked={showWeekend}
                onCheckedChange={(checked) => setShowWeekend(checked)}
              >
                Include weekends
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous week"
            onClick={() => setWeekOffset((value) => value - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next week"
            onClick={() => setWeekOffset((value) => value + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <h3 id="menubar-12-title" className="px-4 pt-3 text-sm font-semibold">
        {view === "day"
          ? weekStart.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })
          : `${shortDate(weekStart)} – ${shortDate(weekEnd)}`}
        <span className="sr-only"> agenda</span>
      </h3>

      <div className="flex flex-col gap-4 p-4">
        {shownDays.map((date) => {
          const day = dayKey(date);
          const dayEvents = events
            .filter((event) => event.day === day && enabled[event.calendar])
            .sort((a, b) => a.time.localeCompare(b.time));
          return (
            <div key={day} className="grid gap-1.5 sm:grid-cols-[3.5rem_1fr] sm:gap-3">
              <p className="text-xs font-medium text-muted-foreground sm:pt-1.5">
                {dayLabel(date)}
              </p>
              {dayEvents.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {dayEvents.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center gap-2.5 rounded-md bg-muted/60 px-2.5 py-1.5 text-sm"
                    >
                      <span
                        className={`size-2 shrink-0 rounded-full ${dotFor(event.calendar)}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {event.title}
                      </span>
                      <time className="text-xs text-muted-foreground tabular-nums">
                        {event.time}
                      </time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-md border border-dashed px-2.5 py-1.5 text-sm text-muted-foreground">
                  Nothing scheduled
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
