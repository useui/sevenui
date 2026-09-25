"use client";

import * as React from "react";

import { Calendar } from "@/registry/base/ui/calendar";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

// Static class strings so Tailwind can see every cell size at build time.
const densities = [
  {
    value: "compact",
    label: "Compact",
    className: "[--cell-size:--spacing(6)]",
  },
  {
    value: "default",
    label: "Default",
    className: "[--cell-size:--spacing(7)]",
  },
  {
    value: "roomy",
    label: "Roomy",
    className: "[--cell-size:--spacing(8)]",
  },
];

export default function Calendar06() {
  const [density, setDensity] = React.useState("default");
  const [weekNumbers, setWeekNumbers] = React.useState(true);
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 11, 9),
  );
  const active =
    densities.find((item) => item.value === density) ?? densities[1];

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          aria-label="Calendar density"
          variant="outline"
          size="sm"
          spacing={0}
          value={[density]}
          onValueChange={(next) => {
            // Keep one density active: ignore attempts to clear the group.
            if (next.length > 0) setDensity(next[0]);
          }}
        >
          {densities.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Switch
            id="calendar-06-week-numbers"
            checked={weekNumbers}
            onCheckedChange={setWeekNumbers}
          />
          <Label htmlFor="calendar-06-week-numbers" className="text-xs">
            Week numbers
          </Label>
        </div>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={new Date(2026, 11, 1)}
        weekStartsOn={1}
        ISOWeek
        showWeekNumber={weekNumbers}
        fixedWeeks
        // The week-number cell is a flex item in each week row; pin its width
        // so the day cells cannot squeeze it under the first column.
        classNames={{
          week_number:
            "w-(--cell-size) shrink-0 text-[0.8rem] text-muted-foreground select-none",
          week_number_header: "w-(--cell-size) shrink-0 select-none",
        }}
        className={`rounded-xl border shadow-sm ${active.className}`}
      />
    </div>
  );
}
