"use client";

import { Field, FieldLabel } from "@/registry/base/ui/field";
import { Switch } from "@/registry/base/ui/switch";
import { LabSection } from "../lab-frame";

const SIZES = ["default", "sm"] as const;

export default function SwitchMatrix() {
  return (
    <div>
      {SIZES.map((size) => (
        <LabSection key={size} title={`size=${size}`}>
          <Switch size={size} aria-label="off" />
          <Switch size={size} aria-label="on" defaultChecked />
          <Switch size={size} aria-label="disabled off" disabled />
          <Switch size={size} aria-label="disabled on" disabled defaultChecked />
          <Switch size={size} aria-label="invalid off" aria-invalid />
          <Switch size={size} aria-label="invalid on" aria-invalid defaultChecked />
        </LabSection>
      ))}
      <LabSection title="with label">
        <Field orientation="horizontal">
          <Switch id="lab-switch-airplane" defaultChecked />
          <FieldLabel htmlFor="lab-switch-airplane">Airplane mode</FieldLabel>
        </Field>
      </LabSection>
    </div>
  );
}
