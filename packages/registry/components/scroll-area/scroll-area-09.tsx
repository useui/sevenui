"use client";

import * as React from "react";
import { Clock, Video } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { ScrollArea } from "@/registry/base/ui/scroll-area";

const days = [
  { id: "2026-10-05", weekday: "Mon", date: 5, open: 6 },
  { id: "2026-10-06", weekday: "Tue", date: 6, open: 3 },
  { id: "2026-10-07", weekday: "Wed", date: 7, open: 0 },
  { id: "2026-10-08", weekday: "Thu", date: 8, open: 8 },
  { id: "2026-10-09", weekday: "Fri", date: 9, open: 4 },
  { id: "2026-10-12", weekday: "Mon", date: 12, open: 7 },
  { id: "2026-10-13", weekday: "Tue", date: 13, open: 5 },
  { id: "2026-10-14", weekday: "Wed", date: 14, open: 2 },
  { id: "2026-10-15", weekday: "Thu", date: 15, open: 8 },
  { id: "2026-10-16", weekday: "Fri", date: 16, open: 6 },
];

const allSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

export default function ScrollArea09() {
  const [dayId, setDayId] = React.useState(days[0].id);
  const [slot, setSlot] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);

  const day = days.find((d) => d.id === dayId) ?? days[0];
  const slots = allSlots.slice(0, day.open);

  function pickDay(id: string) {
    setDayId(id);
    setSlot(null);
    setConfirmed(false);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-10 shrink-0 rounded-full border bg-muted object-cover"
        />
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold">Onboarding call with Hannah Weber</h3>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock aria-hidden="true" className="size-3.5" />
              30 min
            </span>
            <span className="flex items-center gap-1">
              <Video aria-hidden="true" className="size-3.5" />
              Video call
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p id="scroll-area-09-days" className="text-sm font-medium">
          October 2026
        </p>
        <ScrollArea orientation="horizontal" className="-mx-1">
          <fieldset
            aria-labelledby="scroll-area-09-days"
            className="flex w-max gap-2 px-1 pb-3"
          >
            {days.map((d) => {
              const active = d.id === dayId;
              const full = d.open === 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${d.weekday} October ${d.date}, ${full ? "fully booked" : `${d.open} times available`}`}
                  disabled={full}
                  onClick={() => pickDay(d.id)}
                  className="flex w-14 flex-col items-center gap-0.5 rounded-lg border bg-background py-2 text-center outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  <span className="text-[0.7rem] font-medium uppercase opacity-80">
                    {d.weekday}
                  </span>
                  <span className="text-lg leading-tight font-semibold tabular-nums">
                    {d.date}
                  </span>
                  <span className="text-[0.65rem] opacity-80">
                    {full ? "Full" : `${d.open} open`}
                  </span>
                </button>
              );
            })}
          </fieldset>
        </ScrollArea>
      </div>

      <div className="flex flex-col gap-2">
        <p id="scroll-area-09-slots" className="text-sm font-medium">
          Available times · {day.weekday}, Oct {day.date}
        </p>
        <ScrollArea className="h-44 rounded-lg border">
          <fieldset
            aria-labelledby="scroll-area-09-slots"
            className="grid grid-cols-2 gap-2 p-2 pr-3.5"
          >
            {slots.map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={slot === time}
                onClick={() => {
                  setSlot(time);
                  setConfirmed(false);
                }}
                className="rounded-md border bg-background px-3 py-2 text-sm font-medium tabular-nums outline-none transition-colors hover:border-primary hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
              >
                {time}
              </button>
            ))}
          </fieldset>
        </ScrollArea>
        <p className="text-xs text-muted-foreground">
          Times shown in Central European Time (CET).
        </p>
      </div>

      <Button disabled={!slot || confirmed} onClick={() => setConfirmed(true)}>
        {confirmed
          ? `Booked for ${slot}`
          : slot
            ? `Confirm ${day.weekday}, Oct ${day.date} at ${slot}`
            : "Select a time"}
      </Button>
      <p aria-live="polite" className="sr-only">
        {confirmed ? `Call booked for ${day.weekday} October ${day.date} at ${slot}.` : ""}
      </p>
    </div>
  );
}
