"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const resources = [
  { label: "CPU", value: 42 },
  { label: "Memory", value: 78 },
  { label: "Bandwidth", value: 23 },
];

export default function MeterResources() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {resources.map((resource) => (
        <Meter
          key={resource.label}
          value={resource.value}
          className="grid-cols-2"
        >
          <MeterLabel>{resource.label}</MeterLabel>
          <MeterValue className="text-right" />
        </Meter>
      ))}
    </div>
  );
}
