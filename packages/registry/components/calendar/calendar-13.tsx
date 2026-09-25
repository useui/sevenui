"use client";

import * as React from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";

type Absence = {
  name: string;
  initials: string;
  reason: string;
  from: Date;
  to: Date;
};

const teamSize = 6;
const absences: Absence[] = [
  {
    name: "Sofia Alvarez",
    initials: "SA",
    reason: "Sick leave",
    from: new Date(2026, 9, 6),
    to: new Date(2026, 9, 6),
  },
  {
    name: "Priya Raman",
    initials: "PR",
    reason: "Vacation",
    from: new Date(2026, 9, 12),
    to: new Date(2026, 9, 16),
  },
  {
    name: "Daniel Kim",
    initials: "DK",
    reason: "Conference",
    from: new Date(2026, 9, 14),
    to: new Date(2026, 9, 15),
  },
  {
    name: "Liam O'Connor",
    initials: "LO",
    reason: "Vacation",
    from: new Date(2026, 9, 21),
    to: new Date(2026, 9, 23),
  },
  {
    name: "Hana Sato",
    initials: "HS",
    reason: "Parental leave",
    from: new Date(2026, 9, 26),
    to: new Date(2026, 10, 20),
  },
];

function awayOn(date: Date, list: Absence[] = absences) {
  const time = date.getTime();
  return list.filter(
    (absence) => absence.from.getTime() <= time && time <= absence.to.getTime(),
  );
}

function formatSpan(absence: Absence) {
  const short = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return absence.from.getTime() === absence.to.getTime()
    ? short(absence.from)
    : `${short(absence.from)} – ${short(absence.to)}`;
}

const dot =
  "after:pointer-events-none after:absolute after:bottom-1 after:left-1/2 after:z-20 after:size-1 after:-translate-x-1/2 after:rounded-full";

export default function Calendar13() {
  const [date, setDate] = React.useState<Date>(new Date(2026, 9, 14));
  // Your own pending requests, one day each, shown alongside approved leave.
  const [requests, setRequests] = React.useState<Absence[]>([]);
  const all = [...absences, ...requests];
  const away = awayOn(date, all);
  const requested = requests.some(
    (request) => request.from.getTime() === date.getTime(),
  );
  const available = teamSize - away.length;

  return (
    <section
      aria-labelledby="calendar-13-title"
      className="flex w-full max-w-2xl flex-col rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <div className="flex flex-col gap-0.5">
          <h3 id="calendar-13-title" className="text-sm font-medium">
            Team availability
          </h3>
          <p className="text-sm text-muted-foreground">
            Product design · {teamSize} people
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setRequests((current) =>
              requested
                ? current.filter(
                    (request) => request.from.getTime() !== date.getTime(),
                  )
                : [
                    ...current,
                    {
                      name: "You",
                      initials: "ME",
                      reason: "Pending",
                      from: date,
                      to: date,
                    },
                  ],
            )
          }
        >
          {requested ? (
            <XIcon aria-hidden="true" data-icon="inline-start" />
          ) : (
            <PlusIcon aria-hidden="true" data-icon="inline-start" />
          )}
          {requested
            ? "Withdraw request"
            : `Request ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} off`}
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row">
        <div className="flex flex-col gap-3 p-4 sm:border-r">
          <Calendar
            mode="single"
            required
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
            modifiers={{
              oneAway: (day) => awayOn(day, all).length === 1,
              shortStaffed: (day) => awayOn(day, all).length > 1,
            }}
            modifiersClassNames={{
              oneAway: `${dot} after:bg-chart-2`,
              shortStaffed: `${dot} after:bg-warning`,
            }}
            className="mx-auto bg-transparent p-0"
          />
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-chart-2"
              />
              One person out
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-warning"
              />
              Two or more out
            </span>
          </div>
        </div>
        <div
          aria-live="polite"
          className="flex min-w-0 flex-1 flex-col gap-3 border-t p-4 sm:border-t-0"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {available} of {teamSize} available
            </p>
          </div>
          {away.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {away.map((absence) => (
                <li key={absence.name} className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{absence.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm">{absence.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatSpan(absence)}
                    </span>
                  </div>
                  <Badge variant="outline">{absence.reason}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Everyone is in. No approved time off on this day.
            </p>
          )}
          {away.length > 1 ? (
            <p className="mt-auto rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              Design reviews on this day need a stand-in reviewer.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
