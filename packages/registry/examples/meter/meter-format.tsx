"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

export default function MeterFormat() {
  return (
    <Meter
      value={192}
      max={256}
      format={{ style: "unit", unit: "gigabyte" }}
      className="max-w-sm grid-cols-2"
    >
      <MeterLabel>Disk space</MeterLabel>
      <MeterValue className="text-right" />
    </Meter>
  );
}
