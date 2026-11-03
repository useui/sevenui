"use client";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";
import { LabSection } from "../lab-frame";

const VALUES = [0, 30, 75, 100] as const;

export default function MeterMatrix() {
  return (
    <div>
      <LabSection title="values">
        {VALUES.map((value) => (
          <div key={value} className="w-48">
            <Meter value={value} aria-label={`Meter ${value}`} />
          </div>
        ))}
      </LabSection>
      <LabSection title="with label and value">
        <div className="w-72">
          <Meter value={64} className="grid-cols-[1fr_auto]">
            <MeterLabel>Storage used</MeterLabel>
            <MeterValue />
          </Meter>
        </div>
      </LabSection>
      <LabSection title="custom range and formatted value">
        <div className="w-72">
          <Meter value={120} max={200} className="grid-cols-[1fr_auto]">
            <MeterLabel>Seats</MeterLabel>
            <MeterValue>{(_, value) => `${value} of 200`}</MeterValue>
          </Meter>
        </div>
      </LabSection>
    </div>
  );
}
