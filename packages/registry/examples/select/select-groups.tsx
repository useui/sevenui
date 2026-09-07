"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const timezones = {
  Europe: [
    { value: "europe-istanbul", label: "Istanbul" },
    { value: "europe-london", label: "London" },
    { value: "europe-berlin", label: "Berlin" },
  ],
  America: [
    { value: "america-new-york", label: "New York" },
    { value: "america-los-angeles", label: "Los Angeles" },
  ],
};

const items = Object.values(timezones).flat();

export default function SelectGroups() {
  return (
    <Select items={items} defaultValue="europe-istanbul">
      <SelectTrigger size="sm" className="w-45">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          {timezones.Europe.map((zone) => (
            <SelectItem key={zone.value} value={zone.value}>
              {zone.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>America</SelectLabel>
          {timezones.America.map((zone) => (
            <SelectItem key={zone.value} value={zone.value}>
              {zone.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
