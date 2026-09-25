"use client";

import * as React from "react";
import { CalendarClockIcon, GlobeIcon, VideoIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const slots = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];

// Slots that are already booked, keyed by "month-day" (months are 0-based).
const booked: Record<string, string[]> = {
  "9-6": ["09:00", "13:00"],
  "9-8": ["10:30", "14:30", "16:00"],
  "9-13": ["09:00"],
  "10-3": ["13:00", "14:30"],
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function formatSlot(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

export default function Popover11() {
  const [open, setOpen] = React.useState(false);
  const [meeting, setMeeting] = React.useState({
    date: new Date(2026, 9, 6),
    slot: "10:30",
  });
  const [date, setDate] = React.useState<Date | undefined>(meeting.date);
  const [slot, setSlot] = React.useState<string | undefined>(meeting.slot);

  const taken = date
    ? (booked[`${date.getMonth()}-${date.getDate()}`] ?? [])
    : [];
  const unchanged =
    date?.getTime() === meeting.date.getTime() && slot === meeting.slot;

  function handleOpenChange(next: boolean) {
    if (next) {
      setDate(meeting.date);
      setSlot(meeting.slot);
    }
    setOpen(next);
  }

  function confirm() {
    if (!date || !slot) return;
    setMeeting({ date, slot });
    setOpen(false);
  }

  return (
    <article className="w-full max-w-sm rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-md bg-muted leading-none">
          <span className="text-[10px] text-muted-foreground uppercase">
            {meeting.date.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="font-semibold text-base tabular-nums">
            {meeting.date.getDate()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm">
            Onboarding call with Brightline
          </h3>
          <p className="text-muted-foreground text-sm">
            {dateFormat.format(meeting.date)} ·{" "}
            <span className="whitespace-nowrap">
              {formatSlot(meeting.slot)}
            </span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground text-xs">
            <VideoIcon className="size-3.5" aria-hidden="true" />
            45 min · Video call
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" className="flex-1">
          Join call
        </Button>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="flex-1">
                <CalendarClockIcon aria-hidden="true" />
                Reschedule
              </Button>
            }
          />
          <PopoverContent
            align="end"
            className="w-auto max-w-[calc(100vw-2rem)] gap-3 p-3"
          >
            <PopoverTitle className="px-1">Pick a new time</PopoverTitle>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(next) => {
                setDate(next);
                setSlot(undefined);
              }}
              defaultMonth={meeting.date}
              startMonth={new Date(2026, 9)}
              endMonth={new Date(2026, 10)}
              disabled={[
                { before: new Date(2026, 9, 1) },
                { dayOfWeek: [0, 6] },
              ]}
              className="p-0"
            />
            <div className="grid gap-2">
              <p
                id="popover-11-slots"
                className="px-1 font-medium text-muted-foreground text-xs"
              >
                {date ? dateFormat.format(date) : "Select a day first"}
              </p>
              <ToggleGroup
                variant="outline"
                size="sm"
                aria-labelledby="popover-11-slots"
                className="grid w-full grid-cols-3"
                value={slot ? [slot] : []}
                onValueChange={(value) => setSlot(value[0])}
                disabled={!date}
              >
                {slots.map((item) => (
                  <ToggleGroupItem
                    key={item}
                    value={item}
                    disabled={taken.includes(item)}
                    className="tabular-nums data-pressed:border-primary data-pressed:bg-primary data-pressed:text-primary-foreground"
                  >
                    {formatSlot(item)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="flex items-center justify-between gap-2 border-t pt-3">
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <GlobeIcon className="size-3.5" aria-hidden="true" />
                Berlin (CEST)
              </span>
              <Button
                size="sm"
                onClick={confirm}
                disabled={!date || !slot || unchanged}
              >
                Confirm
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </article>
  );
}
