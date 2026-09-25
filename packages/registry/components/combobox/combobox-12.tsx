"use client";

import * as React from "react";
import { CalendarClock } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import { Label } from "@/registry/base/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Slot = {
  value: string;
  label: string;
  conflict: string | null;
  hostBusy: boolean;
};

const days = [
  { value: "tue", label: "Tue", long: "Tuesday, Oct 6" },
  { value: "wed", label: "Wed", long: "Wednesday, Oct 7" },
  { value: "thu", label: "Thu", long: "Thursday, Oct 8" },
];

const times = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "3:00 PM",
  "4:30 PM",
];

// Deterministic sample availability for each day.
const busy: Record<string, Record<string, string | "host">> = {
  tue: { "9:00 AM": "host", "10:30 AM": "Jonas", "1:00 PM": "host", "2:00 PM": "Ava" },
  wed: { "9:30 AM": "Ava", "11:00 AM": "host", "1:30 PM": "Jonas", "3:00 PM": "host" },
  thu: { "10:00 AM": "host", "10:30 AM": "host", "2:00 PM": "Ava", "4:30 PM": "Jonas" },
};

function slotsFor(day: string): Slot[] {
  return times.map((time) => {
    const status = busy[day]?.[time];
    return {
      value: `${day}-${time}`,
      label: time,
      hostBusy: status === "host",
      conflict: status && status !== "host" ? status : null,
    };
  });
}

export default function Combobox12() {
  const [day, setDay] = React.useState("wed");
  const [slot, setSlot] = React.useState<Slot | null>(null);
  const [confirmed, setConfirmed] = React.useState<string | null>(null);
  const slots = React.useMemo(() => slotsFor(day), [day]);
  const dayLabel = days.find((item) => item.value === day)?.long ?? "";

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <CalendarClock aria-hidden="true" className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium">Reschedule: Q4 roadmap review</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            45 min · You, Ava Brooks, Jonas Weber
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <span id="combobox-12-day-label" className="text-sm font-medium">
          Day
        </span>
        <ToggleGroup
          aria-labelledby="combobox-12-day-label"
          variant="outline"
          spacing={0}
          value={[day]}
          onValueChange={(next) => {
            if (next.length === 0) return;
            setDay(next[0]);
            setSlot(null);
            setConfirmed(null);
          }}
          className="w-full"
        >
          {days.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="flex-1 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label htmlFor="combobox-12-time">Start time</Label>
        <Combobox
          items={slots}
          value={slot}
          onValueChange={(value) => {
            setSlot(value);
            setConfirmed(null);
          }}
        >
          <ComboboxInput
            id="combobox-12-time"
            placeholder="Type a time, e.g. 2:00"
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>No open slot at that time.</ComboboxEmpty>
            <ComboboxList>
              {(item: Slot) => (
                <ComboboxItem key={item.value} value={item} disabled={item.hostBusy}>
                  <span className="w-18 tabular-nums">{item.label}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className={
                        item.hostBusy
                          ? "size-1.5 rounded-full bg-muted-foreground"
                          : item.conflict
                            ? "size-1.5 rounded-full bg-warning"
                            : "size-1.5 rounded-full bg-success"
                      }
                    />
                    {item.hostBusy
                      ? "You're busy"
                      : item.conflict
                        ? `${item.conflict} is busy`
                        : "Everyone free"}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {slot?.conflict && (
        <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-foreground">
          {slot.conflict} has another meeting then. They'll be asked to propose
          a new time.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
        <p aria-live="polite" className="min-w-0 text-xs text-muted-foreground">
          {confirmed ?? (slot ? `${dayLabel} at ${slot.label}` : "Pick a new time")}
        </p>
        <Button
          size="sm"
          disabled={!slot}
          onClick={() => slot && setConfirmed(`Update sent for ${dayLabel}, ${slot.label}.`)}
        >
          Send update
        </Button>
      </div>
    </div>
  );
}
