"use client";

import * as React from "react";
import { CheckIcon, GlobeIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";

type Zone = {
  value: string;
  label: string;
  country: string;
  offset: string;
  // Minutes from UTC, used to preview the local send time.
  minutes: number;
};

type Region = { value: string; items: Zone[] };

const regions: Region[] = [
  {
    value: "Americas",
    items: [
      { value: "America/Los_Angeles", label: "Los Angeles", country: "United States", offset: "UTC−7", minutes: -420 },
      { value: "America/New_York", label: "New York", country: "United States", offset: "UTC−4", minutes: -240 },
      { value: "America/Sao_Paulo", label: "São Paulo", country: "Brazil", offset: "UTC−3", minutes: -180 },
    ],
  },
  {
    value: "Europe & Africa",
    items: [
      { value: "Europe/London", label: "London", country: "United Kingdom", offset: "UTC+1", minutes: 60 },
      { value: "Europe/Berlin", label: "Berlin", country: "Germany", offset: "UTC+2", minutes: 120 },
      { value: "Europe/Istanbul", label: "Istanbul", country: "Türkiye", offset: "UTC+3", minutes: 180 },
      { value: "Africa/Lagos", label: "Lagos", country: "Nigeria", offset: "UTC+1", minutes: 60 },
    ],
  },
  {
    value: "Asia & Pacific",
    items: [
      { value: "Asia/Kolkata", label: "Kolkata", country: "India", offset: "UTC+5:30", minutes: 330 },
      { value: "Asia/Singapore", label: "Singapore", country: "Singapore", offset: "UTC+8", minutes: 480 },
      { value: "Asia/Tokyo", label: "Tokyo", country: "Japan", offset: "UTC+9", minutes: 540 },
      { value: "Australia/Sydney", label: "Sydney", country: "Australia", offset: "UTC+10", minutes: 600 },
    ],
  },
];

const allZones = regions.flatMap((region) => region.items);

function matchesZone(zone: Zone, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [zone.label, zone.country, zone.value, zone.offset].some((field) =>
    field.toLowerCase().includes(needle),
  );
}

// The digest goes out at 14:00 UTC; show it in the selected zone.
function digestTime(zone: Zone) {
  const total = (14 * 60 + zone.minutes + 24 * 60) % (24 * 60);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

export default function Command08() {
  const [savedZone, setSavedZone] = React.useState("Europe/Berlin");
  const [draftZone, setDraftZone] = React.useState("Europe/Berlin");
  const [query, setQuery] = React.useState("");

  const draft = allZones.find((zone) => zone.value === draftZone) ?? allZones[0];
  const dirty = draftZone !== savedZone;

  return (
    <section
      aria-labelledby="command-08-title"
      className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex flex-col gap-1 p-4 pb-3">
        <h3 id="command-08-title" className="text-sm font-medium">
          Time zone
        </h3>
        <p className="text-sm text-muted-foreground">
          Due dates, reminders and the daily digest follow this zone.
        </p>
      </header>

      <div className="px-3">
        <Command
          items={regions}
          value={query}
          onValueChange={(next, details) => {
            if (details.reason === "item-press") return;
            setQuery(next);
          }}
          filter={(zone, value) => matchesZone(zone as Zone, value)}
          className="rounded-lg! border border-border bg-background p-0"
        >
          <CommandInput
            placeholder="Search city, country or UTC offset"
            aria-label="Search time zones"
          />
          <CommandList className="max-h-56">
            {(region: Region) => (
              <CommandGroup
                key={region.value}
                heading={region.value}
                items={region.items}
              >
                {(zone: Zone) => {
                  const selected = zone.value === draftZone;
                  return (
                    <CommandItem
                      key={zone.value}
                      value={zone}
                      onClick={() => setDraftZone(zone.value)}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{zone.label}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {zone.country}
                        </span>
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                        {zone.offset}
                      </span>
                      <CheckIcon
                        aria-hidden="true"
                        className={selected ? "text-foreground" : "invisible"}
                      />
                      {selected && <span className="sr-only">(selected)</span>}
                    </CommandItem>
                  );
                }}
              </CommandGroup>
            )}
          </CommandList>
          <CommandEmpty>
            No zone matches “{query}”. Try a nearby city.
          </CommandEmpty>
        </Command>
      </div>

      <p
        aria-live="polite"
        className="flex items-start gap-2 px-4 pt-3 text-sm text-muted-foreground"
      >
        <GlobeIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Your daily digest will arrive at{" "}
          <span className="font-medium text-foreground tabular-nums">
            {digestTime(draft)}
          </span>{" "}
          {draft.label} time.
        </span>
      </p>

      <footer className="mt-3 flex justify-end gap-2 border-t border-border p-3">
        <Button
          variant="ghost"
          disabled={!dirty}
          onClick={() => setDraftZone(savedZone)}
        >
          Reset
        </Button>
        <Button disabled={!dirty} onClick={() => setSavedZone(draftZone)}>
          {dirty ? "Save time zone" : "Saved"}
        </Button>
      </footer>
    </section>
  );
}
