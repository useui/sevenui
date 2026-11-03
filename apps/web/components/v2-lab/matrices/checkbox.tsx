"use client";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { LabSection } from "../lab-frame";

export default function CheckboxMatrix() {
  return (
    <div>
      <LabSection title="states">
        <Checkbox aria-label="off" />
        <Checkbox aria-label="on" defaultChecked />
        <Checkbox aria-label="indeterminate" indeterminate />
        <Checkbox aria-label="disabled off" disabled />
        <Checkbox aria-label="disabled on" disabled defaultChecked />
        <Checkbox aria-label="invalid off" aria-invalid />
        <Checkbox aria-label="invalid on" aria-invalid defaultChecked />
      </LabSection>
      <LabSection title="with label">
        <Field orientation="horizontal">
          <Checkbox id="lab-checkbox-terms" defaultChecked />
          <FieldLabel htmlFor="lab-checkbox-terms">Accept the terms and conditions</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="lab-checkbox-long" />
          <FieldLabel htmlFor="lab-checkbox-long" className="max-w-56">
            A very long label that wraps onto a second line to check alignment
          </FieldLabel>
        </Field>
      </LabSection>
    </div>
  );
}
