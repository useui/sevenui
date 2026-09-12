"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

export default function MeterDemo() {
  return (
    <Meter value={65} className="max-w-sm grid-cols-2">
      <MeterLabel>Storage used</MeterLabel>
      <MeterValue className="text-right" />
    </Meter>
  );
}
