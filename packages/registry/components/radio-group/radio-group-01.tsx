"use client";

import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

export default function RadioGroup01() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p id="radio-group-01-label" className="text-sm font-medium">
          Delivery frequency
        </p>
        <p id="radio-group-01-hint" className="text-sm text-muted-foreground">
          Change it any time before your next box ships.
        </p>
      </div>
      <RadioGroup
        defaultValue="biweekly"
        aria-labelledby="radio-group-01-label"
        aria-describedby="radio-group-01-hint"
        className="flex flex-wrap gap-x-6 gap-y-3"
      >
        {frequencies.map((frequency) => (
          <Label key={frequency.value} className="cursor-pointer font-normal">
            <RadioGroupItem value={frequency.value} />
            {frequency.label}
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
