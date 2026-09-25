"use client";

import { useId, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

const DAY_START = 9;
const DAY_END = 18;
const MIN_SLOT = 0.5; // hours

// Static class strings so Tailwind can see every chart color.
const calendars = [
  {
    id: "jordan",
    name: "Jordan Lee",
    note: "You",
    block: "bg-chart-1",
  },
  {
    id: "priya",
    name: "Priya Shah",
    note: "Design",
    block: "bg-chart-2",
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    note: "Engineering",
    block: "bg-chart-3",
  },
  {
    id: "room",
    name: "Harbor room",
    note: "8 seats",
    block: "bg-chart-4",
  },
];

// Busy blocks for Tuesday, in decimal hours.
const busy: Record<string, [number, number][]> = {
  jordan: [
    [9, 10],
    [13, 14.5],
    [16, 17],
  ],
  priya: [
    [9.5, 11],
    [12, 13],
    [15, 16],
  ],
  marcus: [
    [10, 11.5],
    [14, 15],
  ],
  room: [
    [11, 12],
    [14.5, 15.5],
  ],
};

const ticks = [9, 12, 15, 18];

function formatTime(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h;
  return `${display}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function position(start: number, end: number) {
  const span = DAY_END - DAY_START;
  return {
    left: `${((start - DAY_START) / span) * 100}%`,
    width: `${((end - start) / span) * 100}%`,
  };
}

// Gaps of at least MIN_SLOT where none of the visible calendars are busy.
function freeSlots(ids: string[]) {
  const blocks = ids.flatMap((id) => busy[id]).sort((a, b) => a[0] - b[0]);
  const slots: [number, number][] = [];
  let cursor = DAY_START;
  for (const [start, end] of blocks) {
    if (start - cursor >= MIN_SLOT) slots.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (DAY_END - cursor >= MIN_SLOT) slots.push([cursor, DAY_END]);
  return slots;
}

export default function Checkbox14() {
  const baseId = useId();
  const [visible, setVisible] = useState<string[]>([
    "jordan",
    "priya",
    "marcus",
  ]);
  const [booked, setBooked] = useState<string | null>(null);
  const slots = freeSlots(visible);
  const first = slots[0];
  const firstLabel = first
    ? `${formatTime(first[0])} – ${formatTime(Math.min(first[0] + 1, first[1]))}`
    : null;

  return (
    <div className="w-full max-w-xl rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Find a time</h3>
        <p className="text-xs text-muted-foreground">Tue, Sep 29</p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {calendars.map((calendar) => {
          const checked = visible.includes(calendar.id);
          const id = `${baseId}-${calendar.id}`;
          return (
            <div
              key={calendar.id}
              className="grid grid-cols-1 gap-1.5 sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-3"
            >
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(value) => {
                    setBooked(null);
                    setVisible((prev) =>
                      value
                        ? [...prev, calendar.id]
                        : prev.filter((item) => item !== calendar.id),
                    );
                  }}
                />
                <Label htmlFor={id} className="min-w-0 gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`size-2 shrink-0 rounded-full ${calendar.block}`}
                  />
                  <span className="truncate">{calendar.name}</span>
                  <span className="shrink-0 font-normal text-muted-foreground">
                    {calendar.note}
                  </span>
                </Label>
              </div>
              <div
                aria-hidden="true"
                className="relative h-5 rounded-sm bg-muted/60 data-[visible=false]:opacity-40"
                data-visible={checked}
              >
                {busy[calendar.id].map(([start, end]) => (
                  <span
                    key={start}
                    className={`absolute inset-y-0.5 rounded-[3px] ${checked ? calendar.block : "bg-muted-foreground/30"}`}
                    style={position(start, end)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-3">
          <p className="text-sm font-medium">Everyone free</p>
          <div>
            <div
              aria-hidden="true"
              className="relative h-5 rounded-sm bg-muted/60"
            >
              {slots.map(([start, end]) => (
                <span
                  key={start}
                  className="absolute inset-y-0.5 rounded-[3px] border border-dashed border-foreground/40 bg-background"
                  style={position(start, end)}
                />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="relative mt-1 h-4 text-[10px] text-muted-foreground tabular-nums"
            >
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
                  style={{ left: position(DAY_START, tick).width }}
                >
                  {tick > 12 ? tick - 12 : tick}
                  {tick >= 12 ? "p" : "a"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {booked
            ? `Booked ${booked}. Invites sent.`
            : visible.length === 0
              ? "Select at least one calendar."
              : firstLabel
                ? `First opening: ${firstLabel}`
                : "No shared opening today."}
        </p>
        <Button
          disabled={visible.length === 0 || !firstLabel || booked !== null}
          onClick={() => setBooked(firstLabel)}
        >
          {booked ? "Booked" : "Book slot"}
        </Button>
      </div>
    </div>
  );
}
