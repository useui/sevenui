"use client";

import { CopyIcon, GlobeIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Slider } from "@/registry/base/ui/slider";
import { Switch } from "@/registry/base/ui/switch";

// Values are half-hour slots: 0 is 00:00, 48 is 24:00.
const SLOTS_PER_DAY = 48;

type Day = {
  key: string;
  label: string;
  short: string;
  enabled: boolean;
  range: [number, number];
};

const initialDays: Day[] = [
  { key: "mon", label: "Monday", short: "Mon", enabled: true, range: [18, 35] },
  {
    key: "tue",
    label: "Tuesday",
    short: "Tue",
    enabled: true,
    range: [18, 35],
  },
  {
    key: "wed",
    label: "Wednesday",
    short: "Wed",
    enabled: true,
    range: [20, 30],
  },
  {
    key: "thu",
    label: "Thursday",
    short: "Thu",
    enabled: true,
    range: [18, 35],
  },
  { key: "fri", label: "Friday", short: "Fri", enabled: true, range: [18, 28] },
  {
    key: "sat",
    label: "Saturday",
    short: "Sat",
    enabled: false,
    range: [20, 26],
  },
  {
    key: "sun",
    label: "Sunday",
    short: "Sun",
    enabled: false,
    range: [20, 26],
  },
];

function formatSlot(slot: number) {
  const hours24 = Math.floor(slot / 2) % 24;
  const minutes = slot % 2 === 0 ? "00" : "30";
  const suffix = hours24 < 12 || slot === SLOTS_PER_DAY ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${suffix}`;
}

export default function Slider15() {
  const [days, setDays] = useState(initialDays);

  const weeklyHours = days.reduce(
    (total, day) =>
      day.enabled ? total + (day.range[1] - day.range[0]) / 2 : total,
    0,
  );

  function updateDay(key: string, patch: Partial<Day>) {
    setDays((current) =>
      current.map((day) => (day.key === key ? { ...day, ...patch } : day)),
    );
  }

  function copyMondayToWeekdays() {
    const monday = days[0];
    setDays((current) =>
      current.map((day, index) =>
        index > 0 && index < 5
          ? { ...day, enabled: monday.enabled, range: monday.range }
          : day,
      ),
    );
  }

  return (
    <section
      aria-labelledby="slider-15-title"
      className="flex w-full max-w-lg flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 id="slider-15-title" className="text-sm font-medium">
            Bookable hours
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <GlobeIcon aria-hidden="true" className="size-3.5" />
            Europe/Berlin · {weeklyHours} hours per week
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={copyMondayToWeekdays}>
          <CopyIcon aria-hidden="true" data-icon="inline-start" />
          Copy Monday to weekdays
        </Button>
      </div>

      <ul className="flex flex-col divide-y">
        {days.map((day) => {
          const labelId = `slider-15-${day.key}`;
          return (
            <li
              key={day.key}
              className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Switch
                  aria-label={`Available on ${day.label}`}
                  checked={day.enabled}
                  onCheckedChange={(checked) =>
                    updateDay(day.key, { enabled: checked })
                  }
                />
                <span id={labelId} className="w-10 text-sm font-medium">
                  <span className="sr-only">{day.label} hours</span>
                  <span aria-hidden="true">{day.short}</span>
                </span>
                <span
                  aria-live="polite"
                  className={`ml-auto text-xs tabular-nums ${day.enabled ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {day.enabled
                    ? `${formatSlot(day.range[0])} – ${formatSlot(day.range[1])}`
                    : "Unavailable"}
                </span>
              </div>
              {day.enabled ? (
                <Slider
                  aria-labelledby={labelId}
                  value={day.range}
                  min={0}
                  max={SLOTS_PER_DAY}
                  step={1}
                  largeStep={4}
                  minStepsBetweenValues={1}
                  onValueChange={(value) => {
                    if (Array.isArray(value)) {
                      updateDay(day.key, { range: [value[0], value[1]] });
                    }
                  }}
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      <div
        aria-hidden="true"
        className="flex justify-between border-t pt-2 text-[0.7rem] text-muted-foreground"
      >
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
    </section>
  );
}
