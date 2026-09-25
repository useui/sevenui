"use client";

import { CalendarCheck, Clock, Globe } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const timezoneGroups = [
  {
    label: "Americas",
    zones: [
      { id: "america-los-angeles", label: "Los Angeles (UTC−7)", offset: -7 },
      { id: "america-new-york", label: "New York (UTC−4)", offset: -4 },
      { id: "america-sao-paulo", label: "São Paulo (UTC−3)", offset: -3 },
    ],
  },
  {
    label: "Europe and Africa",
    zones: [
      { id: "europe-london", label: "London (UTC+1)", offset: 1 },
      { id: "europe-berlin", label: "Berlin (UTC+2)", offset: 2 },
      { id: "africa-nairobi", label: "Nairobi (UTC+3)", offset: 3 },
    ],
  },
  {
    label: "Asia Pacific",
    zones: [
      { id: "asia-kolkata", label: "Kolkata (UTC+5:30)", offset: 5.5 },
      { id: "asia-tokyo", label: "Tokyo (UTC+9)", offset: 9 },
      { id: "australia-sydney", label: "Sydney (UTC+10)", offset: 10 },
    ],
  },
];

const zones = timezoneGroups.flatMap((group) => group.zones);

const durations = [15, 30, 45, 60];

// Host availability on Thursday, Oct 2, as minutes after midnight UTC.
const openingsUtc = [14 * 60, 15 * 60, 16 * 60 + 30, 18 * 60, 19 * 60 + 30];

function formatTime(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const suffix = hours < 12 ? "AM" : "PM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const time = `${displayHours}:${mins.toString().padStart(2, "0")} ${suffix}`;
  // Slots can land on the next or previous local day in far-off zones.
  if (minutes >= 1440) return `${time} Fri`;
  if (minutes < 0) return `${time} Wed`;
  return time;
}

export default function NativeSelect13() {
  const [zoneId, setZoneId] = React.useState("europe-berlin");
  const [duration, setDuration] = React.useState(30);
  const [slot, setSlot] = React.useState<number | null>(null);
  const [booked, setBooked] = React.useState(false);

  const zone = zones.find((item) => item.id === zoneId) ?? zones[0];
  const toLocal = (utc: number) => utc + zone.offset * 60;

  return (
    <div className="grid w-full max-w-sm gap-5 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="grid gap-1">
        <h3 className="text-base font-medium">Product demo with Lena Hart</h3>
        <p className="text-sm text-muted-foreground">
          Thursday, October 2 (UTC)
        </p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="native-select-13-zone">
            <Globe
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            Time zone
          </Label>
          <NativeSelect
            id="native-select-13-zone"
            className="w-full"
            value={zoneId}
            onChange={(event) => {
              setZoneId(event.target.value);
              setSlot(null);
              setBooked(false);
            }}
          >
            {timezoneGroups.map((group) => (
              <NativeSelectOptGroup key={group.label} label={group.label}>
                {group.zones.map((item) => (
                  <NativeSelectOption key={item.id} value={item.id}>
                    {item.label}
                  </NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="native-select-13-duration">
            <Clock
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            Length
          </Label>
          <NativeSelect
            id="native-select-13-duration"
            value={duration}
            onChange={(event) => {
              setDuration(Number(event.target.value));
              setBooked(false);
            }}
          >
            {durations.map((minutes) => (
              <NativeSelectOption key={minutes} value={minutes}>
                {minutes} min
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">Available times</legend>
        <div className="grid grid-cols-2 gap-2">
          {openingsUtc.map((utc) => {
            const selected = slot === utc;
            return (
              <Button
                key={utc}
                type="button"
                variant={selected ? "default" : "outline"}
                aria-pressed={selected}
                className="tabular-nums"
                onClick={() => {
                  setSlot(utc);
                  setBooked(false);
                }}
              >
                {formatTime(toLocal(utc))}
              </Button>
            );
          })}
        </div>
      </fieldset>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {slot === null ? (
          "Pick a time to continue."
        ) : (
          <>
            <span className="font-medium text-foreground tabular-nums">
              {formatTime(toLocal(slot))} –{" "}
              {formatTime(toLocal(slot) + duration)}
            </span>{" "}
            in {zone.label.split(" (")[0]}
            {booked ? ". Invite sent to your inbox." : null}
          </>
        )}
      </p>
      <Button
        type="button"
        disabled={slot === null || booked}
        onClick={() => setBooked(true)}
      >
        {booked ? <CalendarCheck aria-hidden="true" /> : null}
        {booked ? "Booked" : "Confirm booking"}
      </Button>
    </div>
  );
}
