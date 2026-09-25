"use client";

import * as React from "react";
import { MapPinIcon, VideoIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/registry/base/ui/sidebar";

type CalendarId = "work" | "team" | "interviews" | "personal";

type CalendarEvent = {
  id: string;
  calendar: CalendarId;
  day: number;
  start: string;
  end: string;
  title: string;
  where: { kind: "video" | "room"; label: string };
};

const calendars: { id: CalendarId; label: string; dot: string }[] = [
  { id: "work", label: "Work", dot: "bg-chart-1" },
  { id: "team", label: "Team rituals", dot: "bg-chart-2" },
  { id: "interviews", label: "Interviews", dot: "bg-chart-3" },
  { id: "personal", label: "Personal", dot: "bg-chart-4" },
];

const events: CalendarEvent[] = [
  { id: "e1", calendar: "team", day: 24, start: "09:30", end: "09:45", title: "Daily standup", where: { kind: "video", label: "Meet" } },
  { id: "e2", calendar: "work", day: 24, start: "11:00", end: "12:00", title: "Pricing page review with Marketing", where: { kind: "room", label: "Harbor room, 4F" } },
  { id: "e3", calendar: "interviews", day: 24, start: "14:00", end: "14:45", title: "Senior frontend, system design", where: { kind: "video", label: "Zoom" } },
  { id: "e4", calendar: "personal", day: 24, start: "17:30", end: "18:30", title: "Climbing gym", where: { kind: "room", label: "Boulder Loft" } },
  { id: "e5", calendar: "team", day: 25, start: "09:30", end: "09:45", title: "Daily standup", where: { kind: "video", label: "Meet" } },
  { id: "e6", calendar: "work", day: 25, start: "13:00", end: "14:30", title: "Q4 roadmap working session", where: { kind: "room", label: "Atlas room, 2F" } },
  { id: "e7", calendar: "team", day: 25, start: "16:00", end: "16:45", title: "Sprint retro", where: { kind: "video", label: "Meet" } },
  { id: "e8", calendar: "interviews", day: 28, start: "10:00", end: "11:00", title: "Product designer, portfolio review", where: { kind: "video", label: "Zoom" } },
  { id: "e9", calendar: "work", day: 29, start: "15:00", end: "15:30", title: "1:1 with Priya", where: { kind: "room", label: "Nook 3" } },
];

const TODAY = new Date(2026, 8, 25);
const dayLabel = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function isSeptember(date: Date) {
  return date.getFullYear() === 2026 && date.getMonth() === 8;
}

export default function Sidebar16() {
  const [selected, setSelected] = React.useState<Date>(TODAY);
  const [month, setMonth] = React.useState<Date>(TODAY);
  const [visible, setVisible] = React.useState<CalendarId[]>([
    "work",
    "team",
    "interviews",
  ]);

  const shown = events.filter((event) => visible.includes(event.calendar));
  const agenda = isSeptember(selected)
    ? shown
        .filter((event) => event.day === selected.getDate())
        .sort((a, b) => a.start.localeCompare(b.start))
    : [];
  const busyDays = Array.from(
    new Set(shown.map((event) => event.day)),
    (day) => new Date(2026, 8, day),
  );
  const hidden = isSeptember(selected)
    ? events.filter(
        (event) => event.day === selected.getDate() && !visible.includes(event.calendar),
      ).length
    : 0;

  return (
    <div className="@container w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <SidebarProvider className="min-h-0 flex-col @xl:h-[500px] @xl:flex-row">
        <Sidebar
          collapsible="none"
          role="region"
          aria-label="Calendars"
          className="w-full border-b @xl:w-64 @xl:border-r @xl:border-b-0"
        >
          <SidebarContent className="@xl:overflow-y-auto">
            <SidebarGroup className="items-center px-0">
              <Calendar
                mode="single"
                required
                selected={selected}
                onSelect={setSelected}
                month={month}
                onMonthChange={setMonth}
                modifiers={{ busy: busyDays }}
                modifiersClassNames={{
                  busy: "relative after:pointer-events-none after:absolute after:bottom-0.5 after:left-1/2 after:z-20 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-sidebar-primary data-[selected=true]:after:bg-primary-foreground",
                }}
                className="bg-transparent"
              />
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel id="sidebar-16-calendars">My calendars</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu aria-labelledby="sidebar-16-calendars" className="gap-0.5">
                  {calendars.map((calendar) => (
                    <SidebarMenuItem key={calendar.id}>
                      <label
                        htmlFor={`sidebar-16-${calendar.id}`}
                        className="flex h-8 items-center gap-2.5 rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <Checkbox
                          id={`sidebar-16-${calendar.id}`}
                          checked={visible.includes(calendar.id)}
                          onCheckedChange={(checked) =>
                            setVisible((current) =>
                              checked
                                ? [...current, calendar.id]
                                : current.filter((id) => id !== calendar.id),
                            )
                          }
                        />
                        <span className="flex-1 truncate">{calendar.label}</span>
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${calendar.dot}`}
                        />
                      </label>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <section
          aria-labelledby="sidebar-16-title"
          className="flex min-w-0 flex-1 flex-col overflow-y-auto"
        >
          <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex min-w-0 flex-col">
              <h2 id="sidebar-16-title" className="truncate text-sm font-semibold">
                {dayLabel.format(selected)}
              </h2>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {agenda.length === 0
                  ? "Nothing scheduled"
                  : `${agenda.length} ${agenda.length === 1 ? "event" : "events"}`}
                {hidden > 0 && ` · ${hidden} hidden`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={selected.getTime() === TODAY.getTime()}
              onClick={() => {
                setSelected(TODAY);
                setMonth(TODAY);
              }}
            >
              Today
            </Button>
          </header>
          {agenda.length === 0 ? (
            <div className="m-auto flex max-w-56 flex-col gap-1 p-8 text-center">
              <p className="text-sm font-medium">A free day</p>
              <p className="text-xs text-muted-foreground">
                {hidden > 0
                  ? "Some events are hidden. Turn their calendars back on to see them."
                  : "Pick a day with a dot to see its meetings."}
              </p>
            </div>
          ) : (
            <ol className="flex flex-col gap-2 p-4">
              {agenda.map((event) => {
                const calendar = calendars.find((item) => item.id === event.calendar);
                const WhereIcon = event.where.kind === "video" ? VideoIcon : MapPinIcon;
                return (
                  <li key={event.id} className="flex gap-3 rounded-lg border p-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-sm font-medium text-balance">{event.title}</span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <time className="tabular-nums">
                          {event.start}–{event.end}
                        </time>
                        <span className="flex items-center gap-1">
                          <WhereIcon className="size-3.5" aria-hidden="true" />
                          {event.where.label}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className={`size-2 rounded-full ${calendar?.dot ?? "bg-muted"}`}
                          />
                          {calendar?.label}
                        </span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </SidebarProvider>
    </div>
  );
}
