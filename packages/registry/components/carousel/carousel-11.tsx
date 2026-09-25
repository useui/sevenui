"use client";

import * as React from "react";
import { cn } from "cn";
import { CalendarCheckIcon, VideoIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const allSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:30 AM",
  "11:00 AM",
  "1:30 PM",
  "2:00 PM",
  "3:30 PM",
  "4:30 PM",
];

// Two weeks of availability starting Monday, September 28.
const days = Array.from({ length: 14 }, (_, index) => {
  const date = new Date(2026, 8, 28 + index);
  const weekday = date.getDay();
  const weekend = weekday === 0 || weekday === 6;
  // Deterministic sample availability: some weekdays are partly booked.
  const slots = weekend
    ? []
    : allSlots.filter((_, slot) => (slot + index) % 3 !== 0);
  return {
    id: date.toISOString().slice(0, 10),
    weekday: weekdays[weekday],
    day: date.getDate(),
    month: date.toLocaleString("en-US", { month: "short" }),
    slots,
  };
});

export default function Carousel11() {
  const [dayId, setDayId] = React.useState(days[1].id);
  const [time, setTime] = React.useState<string | null>(null);
  const [booked, setBooked] = React.useState(false);

  const dayIndex = Math.max(
    days.findIndex((item) => item.id === dayId),
    0,
  );
  const day = days[dayIndex];
  const label = `${day.weekday}, ${day.month} ${day.day}`;

  if (booked && time) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center text-card-foreground">
        <CalendarCheckIcon aria-hidden="true" className="size-8 text-success" />
        <h3 className="font-medium">Demo booked</h3>
        <p className="text-sm text-muted-foreground">
          {label} at {time} (CET) with Maya Chen. A calendar invite and a
          video link are on their way to your inbox.
        </p>
        <Button variant="outline" onClick={() => setBooked(false)}>
          Reschedule
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium">Book a product demo</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <VideoIcon aria-hidden="true" className="size-3.5" />
          30 min · Video call · Times in CET
        </p>
      </div>

      <Carousel
        aria-label="Choose a day"
        // Reopen on the page that holds the selected day (5 days per page).
        opts={{
          align: "start",
          slidesToScroll: 5,
          startIndex: Math.floor(dayIndex / 5),
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">September – October</span>
          <div className="flex gap-1">
            <CarouselPrevious className="static my-0" />
            <CarouselNext className="static my-0" />
          </div>
        </div>
        <CarouselContent className="-ml-1.5 py-1">
          {days.map((item) => {
            const selected = item.id === dayId;
            const empty = item.slots.length === 0;
            const availability = empty
              ? "no availability"
              : `${item.slots.length} times available`;
            return (
              <CarouselItem key={item.id} className="basis-1/5 pl-1.5">
                <button
                  type="button"
                  disabled={empty}
                  aria-pressed={selected}
                  aria-label={`${item.weekday}, ${item.month} ${item.day}, ${availability}`}
                  onClick={() => {
                    setDayId(item.id);
                    setTime(null);
                  }}
                  className={cn(
                    "flex w-full flex-col items-center gap-0.5 rounded-lg border py-2 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "text-[0.6875rem]",
                      selected
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.weekday}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {item.day}
                  </span>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{label}</legend>
        <div className="grid grid-cols-3 gap-2">
          {day.slots.map((slot) => (
            <Button
              key={slot}
              variant={slot === time ? "default" : "outline"}
              size="sm"
              aria-pressed={slot === time}
              onClick={() => setTime(slot)}
              className="tabular-nums"
            >
              {slot}
            </Button>
          ))}
        </div>
      </fieldset>

      <Button disabled={!time} onClick={() => setBooked(true)}>
        {time ? `Confirm ${time}` : "Pick a time"}
      </Button>
    </div>
  );
}
