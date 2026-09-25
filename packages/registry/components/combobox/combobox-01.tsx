"use client";

import { GlobeIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/registry/base/ui/field";
import { InputGroupAddon } from "@/registry/base/ui/input-group";

const timezones = [
  { value: "America/Los_Angeles", label: "Pacific Time", offset: "UTC−07:00" },
  { value: "America/New_York", label: "Eastern Time", offset: "UTC−04:00" },
  { value: "America/Sao_Paulo", label: "Brasília Time", offset: "UTC−03:00" },
  { value: "Europe/London", label: "British Summer Time", offset: "UTC+01:00" },
  { value: "Europe/Berlin", label: "Central European Time", offset: "UTC+02:00" },
  { value: "Europe/Istanbul", label: "Turkey Time", offset: "UTC+03:00" },
  { value: "Asia/Kolkata", label: "India Standard Time", offset: "UTC+05:30" },
  { value: "Asia/Singapore", label: "Singapore Time", offset: "UTC+08:00" },
  { value: "Asia/Tokyo", label: "Japan Standard Time", offset: "UTC+09:00" },
  { value: "Australia/Sydney", label: "Australian Eastern Time", offset: "UTC+10:00" },
];

type Timezone = (typeof timezones)[number];

// Match the zone name, the city in its IANA id, and the offset, so "tokyo"
// finds Japan Standard Time and "+03" finds Turkey Time.
function matchesTimezone(item: Timezone, query: string) {
  const needle = query.trim().toLowerCase();
  return (
    item.label.toLowerCase().includes(needle) ||
    item.value.toLowerCase().replaceAll("_", " ").includes(needle) ||
    item.offset.toLowerCase().replace("−", "-").includes(needle.replace("−", "-"))
  );
}

export default function Combobox01() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="combobox-01-timezone">Timezone</FieldLabel>
      <Combobox
        items={timezones}
        defaultValue={timezones[4]}
        filter={matchesTimezone}
      >
        <ComboboxInput
          id="combobox-01-timezone"
          placeholder="Search timezones"
          className="w-full"
          showClear
        >
          <InputGroupAddon align="inline-start">
            <GlobeIcon aria-hidden="true" />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent>
          <ComboboxEmpty>No timezone matches that search.</ComboboxEmpty>
          <ComboboxList>
            {(item: Timezone) => (
              <ComboboxItem key={item.value} value={item}>
                <span className="truncate">{item.label}</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {item.offset}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Reminders and digests are sent in this timezone.
      </FieldDescription>
    </Field>
  );
}
