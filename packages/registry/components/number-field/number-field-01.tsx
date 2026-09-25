"use client";

import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

const sizes = [
  {
    id: "number-field-01-sm",
    label: "Rows per page",
    hint: "Small · dense tables and toolbars",
    defaultValue: 25,
    step: 5,
    min: 5,
    max: 100,
    group: "h-7",
    stepper: "w-7 [&_svg]:size-3.5",
    input: "w-12 text-xs",
  },
  {
    id: "number-field-01-md",
    label: "Guests",
    hint: "Default · forms and settings",
    defaultValue: 2,
    step: 1,
    min: 1,
    max: 12,
    group: "h-9",
    stepper: "",
    input: "",
  },
  {
    id: "number-field-01-lg",
    label: "Tickets",
    hint: "Large · touch and checkout flows",
    defaultValue: 4,
    step: 1,
    min: 1,
    max: 10,
    group: "h-11 rounded-lg",
    stepper: "w-11 [&_svg]:size-5",
    input: "w-20 text-base font-medium",
  },
];

export default function NumberField01() {
  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <Label htmlFor={size.id}>{size.label}</Label>
            <span className="text-xs text-muted-foreground">{size.hint}</span>
          </div>
          <NumberField
            id={size.id}
            defaultValue={size.defaultValue}
            step={size.step}
            min={size.min}
            max={size.max}
            className="shrink-0"
          >
            <NumberFieldGroup className={size.group}>
              <NumberFieldDecrement className={size.stepper} />
              <NumberFieldInput className={size.input} />
              <NumberFieldIncrement className={size.stepper} />
            </NumberFieldGroup>
          </NumberField>
        </div>
      ))}
    </div>
  );
}
