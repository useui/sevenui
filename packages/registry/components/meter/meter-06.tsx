"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const capacity = 200;

const categories = [
  { name: "Photos", value: 62.4, color: "bg-chart-1" },
  { name: "Backups", value: 41.7, color: "bg-chart-2" },
  { name: "Documents", value: 28.1, color: "bg-chart-3" },
  { name: "Other", value: 9.3, color: "bg-chart-4" },
];

const gigabytes: Intl.NumberFormatOptions = {
  style: "unit",
  unit: "gigabyte",
  maximumFractionDigits: 1,
};

const formatter = new Intl.NumberFormat("en-US", gigabytes);

export default function Meter06() {
  const used = categories.reduce(
    (total, category) => total + category.value,
    0,
  );

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Meter
        value={used}
        max={capacity}
        format={gigabytes}
        locale="en-US"
        getAriaValueText={(formatted) =>
          `${formatted} of ${formatter.format(capacity)}`
        }
        className="grid-cols-[1fr_auto] [&>div:last-of-type]:hidden"
      >
        <MeterLabel>Cloud storage</MeterLabel>
        <MeterValue className="text-right tabular-nums">
          {(formatted) => `${formatted} of ${formatter.format(capacity)}`}
        </MeterValue>
        <div
          aria-hidden="true"
          className="col-span-full flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted"
        >
          {categories.map((category) => (
            <span
              key={category.name}
              className={`h-full ${category.color}`}
              style={{ width: `${(category.value / capacity) * 100}%` }}
            />
          ))}
        </div>
      </Meter>
      <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 gap-y-2 text-sm">
        {categories.map((category) => (
          <li key={category.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${category.color}`}
            />
            <span className="truncate">{category.name}</span>
            <span className="ml-auto whitespace-nowrap text-muted-foreground tabular-nums">
              {formatter.format(category.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
