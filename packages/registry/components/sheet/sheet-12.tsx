"use client";

import * as React from "react";
import { CalendarCheck, CalendarPlus, Clock, Globe, Video } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import { Label } from "@/registry/base/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { Textarea } from "@/registry/base/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

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

const FIRST_BOOKABLE_DAY = new Date(2026, 9, 5);

// Deterministic sample availability: every date hides a different subset.
function slotsFor(date: Date) {
  const seed = date.getDate();
  return allSlots.filter((_, index) => (index + seed) % 3 !== 0);
}

const longDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function Sheet12() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 9, 7),
  );
  const [slot, setSlot] = React.useState<string | null>(null);
  const [booked, setBooked] = React.useState(false);

  const slots = date ? slotsFor(date) : [];

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setBooked(false);
  };

  const selectDate = (next: Date | undefined) => {
    setDate(next);
    setSlot(null);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarFallback>JR</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium">Product walkthrough</p>
          <p className="text-xs text-muted-foreground">
            with Jonah Reyes, Solutions engineer
          </p>
        </div>
      </div>
      <ul className="grid gap-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <Clock aria-hidden="true" className="size-3.5" />
          30 minutes
        </li>
        <li className="flex items-center gap-2">
          <Video aria-hidden="true" className="size-3.5" />
          Video call, link sent after booking
        </li>
      </ul>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger render={<Button className="w-full" />}>
          <CalendarPlus aria-hidden="true" data-icon="inline-start" />
          Pick a time
        </SheetTrigger>
        <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
          {booked && date && slot ? (
            <>
              <SheetHeader className="pr-12">
                <SheetTitle>You're booked</SheetTitle>
                <SheetDescription>
                  A calendar invite is on its way to your inbox.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CalendarCheck aria-hidden="true" className="size-6" />
                </div>
                <div className="grid gap-1">
                  <p className="text-base font-medium">
                    {longDate.format(date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {slot} · 30 min with Jonah Reyes
                  </p>
                </div>
              </div>
              <SheetFooter className="border-t">
                <SheetClose render={<Button className="w-full">Done</Button>} />
                <Button variant="ghost" onClick={() => setBooked(false)}>
                  Reschedule
                </Button>
              </SheetFooter>
            </>
          ) : (
            <>
              <SheetHeader className="border-b pr-12">
                <SheetTitle>Book a product walkthrough</SheetTitle>
                <SheetDescription className="flex items-center gap-1.5">
                  <Globe aria-hidden="true" className="size-3.5" />
                  Times shown in Central European Time
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={selectDate}
                  defaultMonth={date ?? FIRST_BOOKABLE_DAY}
                  disabled={[
                    { before: FIRST_BOOKABLE_DAY },
                    { dayOfWeek: [0, 6] },
                  ]}
                  className="mx-auto rounded-lg border [--cell-size:--spacing(9)]"
                />
                <div className="grid gap-2">
                  <span id="sheet-12-slots" className="text-sm font-medium">
                    {date
                      ? `Available on ${longDate.format(date)}`
                      : "Choose a date to see times"}
                  </span>
                  {date ? (
                    <ToggleGroup
                      aria-labelledby="sheet-12-slots"
                      variant="outline"
                      spacing={2}
                      value={slot ? [slot] : []}
                      onValueChange={(value) => setSlot(value[0] ?? null)}
                      className="grid w-full grid-cols-3"
                    >
                      {slots.map((time) => (
                        <ToggleGroupItem
                          key={time}
                          value={time}
                          className="tabular-nums"
                        >
                          {time}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sheet-12-notes">
                    What should we cover?{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="sheet-12-notes"
                    placeholder="We're migrating 40 seats from another tool and want to see SSO setup."
                    className="min-h-20"
                  />
                </div>
              </div>
              <SheetFooter className="gap-3 border-t">
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  {date && slot
                    ? `${longDate.format(date)} at ${slot}`
                    : "Select a date and time to continue."}
                </p>
                <Button
                  disabled={!date || !slot}
                  onClick={() => setBooked(true)}
                >
                  Confirm booking
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
