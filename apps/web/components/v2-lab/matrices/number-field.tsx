"use client";

import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/registry/base/ui/number-field";
import { LabSection } from "../lab-frame";

function Quantity({
  label,
  invalid,
  ...props
}: React.ComponentProps<typeof NumberField> & { label: string; invalid?: boolean }) {
  return (
    <NumberField {...props}>
      <NumberFieldScrubArea>
        <Label>{label}</Label>
      </NumberFieldScrubArea>
      <NumberFieldGroup>
        <NumberFieldDecrement aria-label="Decrease" />
        <NumberFieldInput aria-label={label} aria-invalid={invalid || undefined} />
        <NumberFieldIncrement aria-label="Increase" />
      </NumberFieldGroup>
    </NumberField>
  );
}

export default function NumberFieldMatrix() {
  return (
    <div>
      <LabSection title="states">
        <Quantity label="Quantity" defaultValue={1024} />
        <Quantity label="At min" defaultValue={0} min={0} />
        <Quantity label="At max" defaultValue={10} max={10} />
        <Quantity label="Disabled" defaultValue={5} disabled />
        <Quantity label="Invalid" defaultValue={5} invalid />
      </LabSection>
      <LabSection title="formatted">
        <Quantity
          label="Price"
          defaultValue={1299.5}
          format={{ style: "currency", currency: "USD" }}
        />
      </LabSection>
      <LabSection title="input only">
        <NumberField defaultValue={42}>
          <NumberFieldGroup>
            <NumberFieldInput aria-label="Input only" />
          </NumberFieldGroup>
        </NumberField>
      </LabSection>
    </div>
  );
}
