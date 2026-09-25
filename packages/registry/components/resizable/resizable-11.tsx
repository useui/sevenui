"use client";

import { CalendarCheck, Clock, Video } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const days = [
  { id: "mon", label: "Mon", date: "Oct 6" },
  { id: "tue", label: "Tue", date: "Oct 7" },
  { id: "wed", label: "Wed", date: "Oct 8" },
];

const slotsByDay: Record<string, string[]> = {
  mon: ["9:00 AM", "9:30 AM", "11:00 AM", "1:30 PM", "3:00 PM", "4:30 PM"],
  tue: ["10:00 AM", "10:30 AM", "2:00 PM", "2:30 PM"],
  wed: ["9:00 AM", "12:00 PM", "12:30 PM", "1:00 PM", "3:30 PM"],
};

export default function Resizable11() {
  const [dayId, setDayId] = React.useState(days[0].id);
  const [slot, setSlot] = React.useState<string | null>(null);
  const [booked, setBooked] = React.useState(false);
  const day = days.find((item) => item.id === dayId) ?? days[0];

  return (
    <div className="h-[380px] w-full max-w-2xl">
      <ResizablePanelGroup className="rounded-xl border bg-card text-card-foreground">
        <ResizablePanel defaultSize="58%" minSize="40%">
          <section
            aria-labelledby="resizable-11-slots"
            className="@container flex h-full flex-col gap-3 overflow-y-auto p-4"
          >
            <h3 id="resizable-11-slots" className="text-sm font-semibold">
              Pick a time
            </h3>
            <fieldset
              aria-label="Day"
              className="grid grid-cols-3 gap-1.5"
            >
              {days.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === dayId}
                  onClick={() => {
                    setDayId(item.id);
                    setSlot(null);
                    setBooked(false);
                  }}
                  className="flex flex-col items-center rounded-lg border px-1 py-1.5 text-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="opacity-80">{item.date}</span>
                </button>
              ))}
            </fieldset>
            <fieldset
              aria-label={`Available times on ${day.label}, ${day.date}`}
              className="grid grid-cols-1 gap-1.5 @[16rem]:grid-cols-2 @[24rem]:grid-cols-3"
            >
              {slotsByDay[dayId].map((time) => (
                <button
                  key={time}
                  type="button"
                  aria-pressed={time === slot}
                  onClick={() => {
                    setSlot(time);
                    setBooked(false);
                  }}
                  className="h-8 rounded-md border text-sm tabular-nums outline-none transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:font-medium"
                >
                  {time}
                </button>
              ))}
            </fieldset>
          </section>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize booking summary" />
        <ResizablePanel defaultSize="42%" minSize="30%">
          <aside
            aria-label="Booking summary"
            className="@container flex h-full flex-col gap-4 bg-muted/40 p-4"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold">Onboarding call</h3>
              <p className="text-xs text-muted-foreground">
                with Jordan Lee, Customer Success
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Clock aria-hidden="true" className="size-4 shrink-0" />
                30 minutes
              </li>
              <li className="flex items-center gap-2">
                <Video aria-hidden="true" className="size-4 shrink-0" />
                Video link sent by email
              </li>
            </ul>
            <div className="mt-auto flex flex-col gap-2">
              <p className="text-sm" aria-live="polite">
                {booked ? (
                  <span className="flex items-center gap-1.5 font-medium text-success">
                    <CalendarCheck aria-hidden="true" className="size-4" />
                    Booked for {day.label} at {slot}
                  </span>
                ) : slot ? (
                  <span>
                    {day.label}, {day.date} at{" "}
                    <span className="font-medium">{slot}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">No time selected</span>
                )}
              </p>
              <Button
                disabled={!slot || booked}
                onClick={() => setBooked(true)}
              >
                Confirm
                <span className="hidden @[10rem]:inline">booking</span>
              </Button>
            </div>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
