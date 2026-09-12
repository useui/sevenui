"use client";

import { Label } from "@/registry/base/ui/label";
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
  "North America": [
    { value: "america-new-york", label: "New York (ET)" },
    { value: "america-chicago", label: "Chicago (CT)" },
    { value: "america-los-angeles", label: "Los Angeles (PT)" },
  ],
  Europe: [
    { value: "europe-london", label: "London (GMT)" },
    { value: "europe-berlin", label: "Berlin (CET)" },
    { value: "europe-istanbul", label: "Istanbul (TRT)" },
  ],
};

const items = Object.values(timezones).flat();

export default function Select02() {
  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <Label htmlFor="select-02-timezone">Timezone</Label>
      <Select items={items} defaultValue="europe-istanbul">
        <SelectTrigger id="select-02-timezone" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>North America</SelectLabel>
            {timezones["North America"].map((zone) => (
              <SelectItem key={zone.value} value={zone.value}>
                {zone.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            {timezones.Europe.map((zone) => (
              <SelectItem key={zone.value} value={zone.value}>
                {zone.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
