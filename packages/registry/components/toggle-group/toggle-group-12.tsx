"use client";

import * as React from "react";
import { CalendarClock, Check, Moon, Sun, Sunrise } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const days = [
  { value: "mon", short: "M", label: "Monday" },
  { value: "tue", short: "T", label: "Tuesday" },
  { value: "wed", short: "W", label: "Wednesday" },
  { value: "thu", short: "T", label: "Thursday" },
  { value: "fri", short: "F", label: "Friday" },
  { value: "sat", short: "S", label: "Saturday" },
  { value: "sun", short: "S", label: "Sunday" },
];

const windows = [
  { value: "morning", label: "Morning", hours: "8am-12pm", span: 4, icon: Sunrise },
  { value: "afternoon", label: "Afternoon", hours: "12-5pm", span: 5, icon: Sun },
  { value: "evening", label: "Evening", hours: "5-8pm", span: 3, icon: Moon },
];

const durations = ["15", "30", "45", "60"];

export default function ToggleGroup12() {
  const [selectedDays, setSelectedDays] = React.useState<string[]>([
    "tue",
    "wed",
    "thu",
  ]);
  const [selectedWindows, setSelectedWindows] = React.useState<string[]>([
    "afternoon",
  ]);
  const [duration, setDuration] = React.useState("30");
  const [saved, setSaved] = React.useState(false);

  const hoursPerDay = windows
    .filter((period) => selectedWindows.includes(period.value))
    .reduce((total, period) => total + period.span, 0);
  const slots = Math.floor(
    (selectedDays.length * hoursPerDay * 60) / Number(duration),
  );
  const dayNames = days
    .filter((day) => selectedDays.includes(day.value))
    .map((day) => day.label.slice(0, 3))
    .join(", ");
  const ready = selectedDays.length > 0 && selectedWindows.length > 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Office hours</CardTitle>
        <CardDescription>
          Set when customers can book a call with you.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span id="toggle-group-12-days" className="text-sm font-medium">
            Repeats on
          </span>
          <ToggleGroup
            multiple
            aria-labelledby="toggle-group-12-days"
            spacing={1}
            value={selectedDays}
            onValueChange={(next) => {
              setSelectedDays(next);
              setSaved(false);
            }}
            className="w-full justify-between"
          >
            {days.map((day) => (
              <ToggleGroupItem
                key={day.value}
                value={day.value}
                aria-label={day.label}
                className="size-8 rounded-full! border border-border aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground sm:size-9"
              >
                {day.short}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-2">
          <span id="toggle-group-12-windows" className="text-sm font-medium">
            Time of day
          </span>
          <ToggleGroup
            multiple
            aria-labelledby="toggle-group-12-windows"
            variant="outline"
            spacing={2}
            value={selectedWindows}
            onValueChange={(next) => {
              setSelectedWindows(next);
              setSaved(false);
            }}
            className="grid w-full grid-cols-3"
          >
            {windows.map((period) => (
              <ToggleGroupItem
                key={period.value}
                value={period.value}
                className="h-auto flex-col gap-1 py-2.5 aria-pressed:border-primary aria-pressed:bg-primary/5"
              >
                <period.icon aria-hidden="true" />
                <span>{period.label}</span>
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {period.hours}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span id="toggle-group-12-duration" className="text-sm font-medium">
            Slot length
          </span>
          <ToggleGroup
            aria-labelledby="toggle-group-12-duration"
            variant="outline"
            size="sm"
            spacing={0}
            value={[duration]}
            onValueChange={(next) => {
              if (next[0]) {
                setDuration(next[0]);
                setSaved(false);
              }
            }}
          >
            {durations.map((minutes) => (
              <ToggleGroupItem
                key={minutes}
                value={minutes}
                aria-label={`${minutes} minutes`}
                className="tabular-nums"
              >
                {minutes}m
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg bg-muted p-3 text-sm"
        >
          <CalendarClock
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {ready ? (
            <p>
              <span className="font-medium tabular-nums">{slots} slots</span>{" "}
              a week on {dayNames}.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Pick at least one day and one time of day to open bookings.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-3">
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {saved ? "Bookings open with these hours." : ""}
        </span>
        <Button disabled={!ready || saved} onClick={() => setSaved(true)}>
          {saved && <Check aria-hidden="true" data-icon="inline-start" />}
          {saved ? "Saved" : "Save availability"}
        </Button>
      </CardFooter>
    </Card>
  );
}
