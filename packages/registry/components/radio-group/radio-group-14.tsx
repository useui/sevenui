"use client";

import * as React from "react";
import { CalendarCheck, Clock, Globe, Video } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const days = [
  { value: "2026-09-28", weekday: "Mon", date: "28", long: "Monday, September 28" },
  { value: "2026-09-29", weekday: "Tue", date: "29", long: "Tuesday, September 29" },
  { value: "2026-09-30", weekday: "Wed", date: "30", long: "Wednesday, September 30" },
  { value: "2026-10-01", weekday: "Thu", date: "1", long: "Thursday, October 1" },
  { value: "2026-10-02", weekday: "Fri", date: "2", long: "Friday, October 2" },
];

const times = ["9:00 AM", "9:30 AM", "10:30 AM", "11:00 AM", "1:30 PM", "2:00 PM", "3:30 PM", "4:00 PM"];

// Slots already taken, keyed by day.
const booked: Record<string, string[]> = {
  "2026-09-28": ["9:00 AM", "9:30 AM", "2:00 PM"],
  "2026-09-29": ["10:30 AM", "11:00 AM", "1:30 PM", "4:00 PM"],
  "2026-09-30": ["3:30 PM"],
  "2026-10-01": [...times],
  "2026-10-02": ["9:00 AM", "4:00 PM"],
};

export default function RadioGroup14() {
  const [day, setDay] = React.useState(days[1].value);
  const [time, setTime] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);
  const selectedDay = days.find((item) => item.value === day) ?? days[0];
  const taken = booked[day] ?? [];
  const openCount = times.length - taken.length;

  if (confirmed && time) {
    return (
      <div
        role="status"
        className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center text-card-foreground"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarCheck aria-hidden="true" className="size-5" />
        </span>
        <h3 className="text-base font-semibold">You're booked with Priya</h3>
        <p className="text-sm text-muted-foreground">
          {selectedDay.long} at {time} (PDT). A calendar invite with the video link is on its way
          to your inbox.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setConfirmed(false);
            setTime(null);
          }}
        >
          Reschedule
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (time) setConfirmed(true);
      }}
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarFallback>PS</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-sm font-semibold">Product demo with Priya Shah</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="size-3.5" />
              30 min
            </span>
            <span className="inline-flex items-center gap-1">
              <Video aria-hidden="true" className="size-3.5" />
              Google Meet
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe aria-hidden="true" className="size-3.5" />
              Pacific Time (PDT)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span id="radio-group-14-day" className="text-sm font-medium">
          Pick a day
        </span>
        <RadioGroup
          aria-labelledby="radio-group-14-day"
          value={day}
          onValueChange={(value) => {
            setDay(value as string);
            setTime(null);
          }}
          className="grid grid-cols-5 gap-1.5"
        >
          {days.map((item) => {
            const full = (booked[item.value] ?? []).length >= times.length;
            return (
              <Label
                key={item.value}
                className="cursor-pointer flex-col gap-1 rounded-lg border border-border py-2 font-normal transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:border-primary has-data-checked:bg-primary has-data-checked:text-primary-foreground has-data-disabled:cursor-not-allowed has-data-disabled:hover:bg-transparent"
              >
                <RadioGroupItem
                  value={item.value}
                  disabled={full}
                  aria-label={full ? `${item.long}, fully booked` : item.long}
                  className="sr-only absolute"
                />
                <span className="text-xs opacity-80">{item.weekday}</span>
                <span className="text-base font-semibold tabular-nums">{item.date}</span>
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span id="radio-group-14-time" className="text-sm font-medium">
            Available times
          </span>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {openCount} open on {selectedDay.weekday}
          </span>
        </div>
        <RadioGroup
          aria-labelledby="radio-group-14-time"
          value={time}
          onValueChange={(value) => setTime(value as string)}
          className="grid grid-cols-2 gap-1.5 min-[400px]:grid-cols-4"
        >
          {times.map((slot) => {
            const isTaken = taken.includes(slot);
            return (
              <Label
                key={slot}
                className="cursor-pointer justify-center rounded-md border border-border py-2 text-xs font-medium tabular-nums transition-colors hover:border-primary/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:border-primary has-data-checked:bg-primary/10 has-data-checked:text-foreground has-data-disabled:cursor-not-allowed has-data-disabled:border-dashed has-data-disabled:text-muted-foreground has-data-disabled:line-through has-data-disabled:hover:border-border"
              >
                <RadioGroupItem value={slot} disabled={isTaken} className="sr-only absolute" />
                {slot}
                {isTaken && <span className="sr-only">(booked)</span>}
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
        <p className="text-xs text-muted-foreground">
          {time ? `${selectedDay.long}, ${time}` : "Select a time to continue"}
        </p>
        <Button type="submit" disabled={!time}>
          Confirm booking
        </Button>
      </div>
    </form>
  );
}
