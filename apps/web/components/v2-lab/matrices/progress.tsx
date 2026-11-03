"use client";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";
import { LabSection } from "../lab-frame";

const VALUES = [0, 25, 60, 100] as const;

export default function ProgressMatrix() {
  return (
    <div>
      <LabSection title="values">
        {VALUES.map((value) => (
          <div key={value} className="w-48">
            <Progress value={value} aria-label={`Progress ${value}`} />
          </div>
        ))}
      </LabSection>
      <LabSection title="with label and value">
        <div className="w-72">
          <Progress value={42}>
            <ProgressLabel>Uploading</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      </LabSection>
      <LabSection title="indeterminate (value=null)">
        <div className="w-72">
          <Progress value={null}>
            <ProgressLabel>Preparing</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      </LabSection>
    </div>
  );
}
