"use client";

import { Slider } from "@/registry/base/ui/slider";
import { LabSection } from "../lab-frame";

export default function SliderMatrix() {
  return (
    <div>
      <LabSection title="single">
        <div className="w-64">
          <Slider defaultValue={[40]} aria-label="single" />
        </div>
      </LabSection>
      <LabSection title="range">
        <div className="w-64">
          <Slider defaultValue={[25, 75]} aria-label="range" />
        </div>
      </LabSection>
      <LabSection title="empty / full">
        <div className="w-64">
          <Slider defaultValue={[0]} aria-label="empty" />
        </div>
        <div className="w-64">
          <Slider defaultValue={[100]} aria-label="full" />
        </div>
      </LabSection>
      <LabSection title="disabled">
        <div className="w-64">
          <Slider defaultValue={[60]} disabled aria-label="disabled" />
        </div>
      </LabSection>
      <LabSection title="vertical">
        <div className="h-40">
          <Slider defaultValue={[50]} orientation="vertical" aria-label="vertical" />
        </div>
        <div className="h-40">
          <Slider defaultValue={[20, 80]} orientation="vertical" aria-label="vertical range" />
        </div>
      </LabSection>
    </div>
  );
}
