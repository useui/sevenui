"use client";

import * as React from "react";
import { CheckIcon, ClockIcon, GlobeIcon, VideoIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import { Separator } from "@/registry/base/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const today = new Date(2026, 9, 5);
const lastBookable = new Date(2026, 10, 30);
const allSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:30 AM",
  "11:00 AM",
  "1:00 PM",
  "2:30 PM",
  "3:00 PM",
  "4:30 PM",
];
// Fully booked days, on top of weekends.
const fullyBooked = [new Date(2026, 9, 8), new Date(2026, 9, 15)];

// Deterministic sample availability: each date hides a different subset.
function slotsFor(date: Date) {
  const seed = date.getDate() + date.getMonth();
  return allSlots.filter((_, index) => (index + seed) % 3 !== 0);
}

export default function Calendar11() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 9, 7),
  );
  const [slot, setSlot] = React.useState<string | undefined>();
  const [booked, setBooked] = React.useState(false);
  const slots = date ? slotsFor(date) : [];

  if (booked && date && slot) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center text-card-foreground">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon aria-hidden="true" className="size-5" />
        </span>
        <div className="flex flex-col gap-1" role="status">
          <p className="font-medium">Your onboarding call is booked</p>
          <p className="text-sm text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            at {slot}. A calendar invite with the video link is on its way.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setBooked(false);
            setSlot(undefined);
          }}
        >
          Pick another time
        </Button>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="calendar-11-title"
      className="flex w-full max-w-2xl flex-col rounded-xl border bg-card text-card-foreground sm:flex-row"
    >
      <div className="flex flex-col gap-3 p-4 sm:w-52 sm:shrink-0 sm:border-r">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Maya Okafor</p>
          <h3 id="calendar-11-title" className="font-medium">
            Onboarding call
          </h3>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <ClockIcon aria-hidden="true" className="size-4" />
            30 minutes
          </li>
          <li className="flex items-center gap-2">
            <VideoIcon aria-hidden="true" className="size-4" />
            Video call
          </li>
          <li className="flex items-center gap-2">
            <GlobeIcon aria-hidden="true" className="size-4" />
            Pacific Time (UTC−7)
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          We will connect your data sources and set up your first dashboard
          together.
        </p>
      </div>
      <Separator className="sm:hidden" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row">
        <Calendar
          mode="single"
          required
          selected={date}
          onSelect={(next) => {
            setDate(next);
            setSlot(undefined);
          }}
          defaultMonth={today}
          startMonth={today}
          endMonth={lastBookable}
          disabled={[
            { before: new Date(2026, 9, 6) },
            { after: lastBookable },
            { dayOfWeek: [0, 6] },
            ...fullyBooked,
          ]}
          className="mx-auto bg-transparent p-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:w-36 md:flex-none">
          <p id="calendar-11-slots" className="text-sm font-medium">
            {date
              ? date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "Pick a day"}
          </p>
          <ToggleGroup
            aria-labelledby="calendar-11-slots"
            variant="outline"
            orientation="vertical"
            spacing={2}
            value={slot ? [slot] : []}
            onValueChange={(next) => setSlot(next[0])}
            className="grid w-full grid-cols-2 gap-2 md:grid-cols-1"
          >
            {slots.map((time) => (
              <ToggleGroupItem
                key={time}
                value={time}
                className="w-full tabular-nums data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground"
              >
                {time}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button
            className="mt-auto w-full"
            disabled={!slot}
            onClick={() => setBooked(true)}
          >
            {slot ? `Book ${slot}` : "Select a time"}
          </Button>
        </div>
      </div>
    </section>
  );
}
