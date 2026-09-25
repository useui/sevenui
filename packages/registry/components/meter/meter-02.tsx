"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const nutrients = [
  { name: "Protein", value: 86, max: 120, unit: "g" },
  { name: "Fiber", value: 18, max: 30, unit: "g" },
  { name: "Carbs", value: 164, max: 250, unit: "g" },
  { name: "Water", value: 1.6, max: 2.5, unit: "L" },
];

export default function Meter02() {
  return (
    <section
      aria-labelledby="meter-02-title"
      className="w-full max-w-md rounded-lg border border-border"
    >
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3">
        <h3 id="meter-02-title" className="text-sm font-medium">
          Today's intake
        </h3>
        <span className="text-xs text-muted-foreground">Logged at 6:40 PM</span>
      </header>
      <ul className="divide-y divide-border">
        {nutrients.map((nutrient) => (
          <li key={nutrient.name} className="px-4 py-3">
            <Meter
              value={nutrient.value}
              max={nutrient.max}
              getAriaValueText={() =>
                `${nutrient.value} of ${nutrient.max} ${nutrient.unit} daily target`
              }
              className="grid-cols-[4.5rem_minmax(0,1fr)_5.5rem] items-center gap-3 [&>div]:col-span-1 [&>div]:col-start-2 [&>div]:row-start-1 [&>div]:h-1.5"
            >
              <MeterLabel className="col-start-1 row-start-1 truncate font-normal">
                {nutrient.name}
              </MeterLabel>
              <MeterValue className="col-start-3 row-start-1 text-right whitespace-nowrap text-xs tabular-nums">
                {() => `${nutrient.value} / ${nutrient.max} ${nutrient.unit}`}
              </MeterValue>
            </Meter>
          </li>
        ))}
      </ul>
    </section>
  );
}
