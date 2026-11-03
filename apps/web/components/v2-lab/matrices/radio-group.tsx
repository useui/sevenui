"use client";

import { Field, FieldLabel } from "@/registry/base/ui/field";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { LabSection } from "../lab-frame";

const PLANS = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team, with a longer label that wraps onto a second line" },
];

export default function RadioGroupMatrix() {
  return (
    <div>
      <LabSection title="states">
        <RadioGroup defaultValue="pro" aria-label="Plan" className="w-auto">
          {PLANS.map((plan) => (
            <Field key={plan.value} orientation="horizontal">
              <RadioGroupItem value={plan.value} id={`lab-radio-${plan.value}`} />
              <FieldLabel htmlFor={`lab-radio-${plan.value}`} className="max-w-56">
                {plan.label}
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </LabSection>
      <LabSection title="disabled">
        <RadioGroup defaultValue="a" disabled aria-label="Disabled" className="w-auto grid-flow-col">
          <RadioGroupItem value="a" aria-label="disabled on" />
          <RadioGroupItem value="b" aria-label="disabled off" />
        </RadioGroup>
      </LabSection>
      <LabSection title="invalid">
        <RadioGroup defaultValue="a" aria-label="Invalid" className="w-auto grid-flow-col">
          <RadioGroupItem value="a" aria-invalid aria-label="invalid on" />
          <RadioGroupItem value="b" aria-invalid aria-label="invalid off" />
        </RadioGroup>
      </LabSection>
    </div>
  );
}
