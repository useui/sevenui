"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const meters: {
  label: string;
  value: number;
  max: number;
  format: Intl.NumberFormatOptions;
  note: string;
}[] = [
  {
    label: "Ad spend",
    value: 3420,
    max: 5000,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
    note: "Campaign budget resets on October 1.",
  },
  {
    label: "Media library",
    value: 18.4,
    max: 25,
    format: { style: "unit", unit: "gigabyte", maximumFractionDigits: 1 },
    note: "Uploads pause when the library reaches its limit.",
  },
  {
    label: "API requests",
    value: 842000,
    max: 1000000,
    format: { notation: "compact", maximumFractionDigits: 1 },
    note: "Counted per calendar month across all keys.",
  },
];

export default function Meter03() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {meters.map((meter) => {
        const formattedMax = new Intl.NumberFormat(
          "en-US",
          meter.format,
        ).format(meter.max);
        return (
          <div key={meter.label} className="flex flex-col gap-1.5">
            <Meter
              value={meter.value}
              max={meter.max}
              format={meter.format}
              locale="en-US"
              getAriaValueText={(formatted) =>
                `${formatted} of ${formattedMax}`
              }
              className="grid-cols-[1fr_auto]"
            >
              <MeterLabel>{meter.label}</MeterLabel>
              <MeterValue className="text-right tabular-nums">
                {(formatted) => (
                  <>
                    <span className="font-medium text-foreground">
                      {formatted}
                    </span>{" "}
                    of {formattedMax}
                  </>
                )}
              </MeterValue>
            </Meter>
            <p className="text-xs text-muted-foreground">{meter.note}</p>
          </div>
        );
      })}
    </div>
  );
}
