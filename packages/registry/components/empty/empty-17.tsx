"use client";

import * as React from "react";
import { CalendarCheckIcon, CoffeeIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

type Meeting = { id: string; day: number; start: string; end: string; title: string };

const initialMeetings: Meeting[] = [
  { id: "m-1", day: 22, start: "10:00", end: "10:30", title: "Sprint planning" },
  { id: "m-2", day: 23, start: "14:00", end: "15:00", title: "Design review: onboarding" },
  { id: "m-3", day: 24, start: "09:30", end: "09:45", title: "Standup" },
  { id: "m-4", day: 28, start: "11:00", end: "12:00", title: "Quarterly roadmap sync" },
  { id: "m-5", day: 28, start: "16:00", end: "16:30", title: "1:1 with Jordan" },
];

const month = new Date(2026, 8, 1);

const dayLabel = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

const shortLabel = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export default function Empty17() {
  const [selected, setSelected] = React.useState<Date>(new Date(2026, 8, 25));
  const [meetings, setMeetings] = React.useState(initialMeetings);

  const day = selected.getDate();
  const agenda = meetings.filter((meeting) => meeting.day === day);
  const nextBusyDay = meetings
    .map((meeting) => meeting.day)
    .filter((value) => value > day)
    .sort((a, b) => a - b)[0];
  const busyDays = Array.from(
    new Set(meetings.map((meeting) => meeting.day)),
    (value) => new Date(2026, 8, value),
  );

  function blockFocusTime() {
    setMeetings((current) => [
      ...current,
      {
        id: `focus-${day}`,
        day,
        start: "09:00",
        end: "11:00",
        title: "Focus time",
      },
    ]);
  }

  return (
    <section
      aria-labelledby="empty-17-title"
      className="@container w-full max-w-2xl rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <div className="flex flex-col @xl:flex-row">
        <div className="flex justify-center border-b p-2 @xl:border-r @xl:border-b-0">
          <Calendar
            mode="single"
            required
            selected={selected}
            onSelect={setSelected}
            month={month}
            disableNavigation
            disabled={(date) => date.getMonth() !== month.getMonth()}
            modifiers={{ busy: busyDays }}
            modifiersClassNames={{
              busy: "relative after:pointer-events-none after:absolute after:bottom-0.5 after:left-1/2 after:z-20 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-chart-2",
            }}
            className="bg-transparent"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <h2 id="empty-17-title" className="text-sm font-medium">
            {dayLabel.format(selected)}
          </h2>
          <p className="text-xs text-muted-foreground">
            {agenda.length === 0
              ? "No events"
              : `${agenda.length} ${agenda.length === 1 ? "event" : "events"}`}
          </p>
          <div className="mt-3 flex flex-1 flex-col" aria-live="polite">
            {agenda.length === 0 ? (
              <Empty className="flex-1 border bg-muted/30 px-4 py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CoffeeIcon aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>Your day is wide open</EmptyTitle>
                  <EmptyDescription>
                    No meetings are booked. Protect a block before someone
                    else fills it.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button size="sm" onClick={blockFocusTime}>
                    <PlusIcon data-icon="inline-start" aria-hidden="true" />
                    Block 9&ndash;11 AM for focus
                  </Button>
                  {nextBusyDay && (
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => setSelected(new Date(2026, 8, nextBusyDay))}
                    >
                      Next event: {shortLabel.format(new Date(2026, 8, nextBusyDay))}
                    </Button>
                  )}
                </EmptyContent>
              </Empty>
            ) : (
              <ul className="flex flex-col gap-2">
                {agenda
                  .slice()
                  .sort((a, b) => a.start.localeCompare(b.start))
                  .map((meeting) => (
                    <li
                      key={meeting.id}
                      className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
                    >
                      <CalendarCheckIcon
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {meeting.title}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {meeting.start} &ndash; {meeting.end}
                        </p>
                      </div>
                      {meeting.id.startsWith("focus-") && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Remove focus time"
                          onClick={() =>
                            setMeetings((current) =>
                              current.filter((item) => item.id !== meeting.id),
                            )
                          }
                        >
                          <Trash2Icon aria-hidden="true" />
                        </Button>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
