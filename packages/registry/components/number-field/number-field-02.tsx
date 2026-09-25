"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

const fields = [
  {
    id: "number-field-02-size",
    label: "Font size",
    unit: "px",
    defaultValue: 16,
    step: 1,
    min: 8,
    max: 96,
    format: undefined,
  },
  {
    id: "number-field-02-leading",
    label: "Line height",
    unit: "×",
    defaultValue: 1.5,
    step: 0.05,
    min: 1,
    max: 3,
    format: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  },
];

const stackedStepper =
  "h-auto w-7 flex-1 border-l-0 bg-transparent [&_svg]:size-3.5";

export default function NumberField02() {
  return (
    <div className="grid w-full max-w-sm grid-cols-1 gap-4 min-[360px]:grid-cols-2">
      {fields.map((field) => (
        <NumberField
          key={field.id}
          id={field.id}
          defaultValue={field.defaultValue}
          step={field.step}
          min={field.min}
          max={field.max}
          format={field.format}
        >
          <Label htmlFor={field.id}>{field.label}</Label>
          <NumberFieldGroup className="w-full">
            <NumberFieldInput className="min-w-0 flex-1 pl-3 text-left" />
            <span
              aria-hidden="true"
              className="flex items-center pr-2 text-xs text-muted-foreground"
            >
              {field.unit}
            </span>
            <div className="flex flex-col border-l border-input bg-muted/50">
              <NumberFieldIncrement
                aria-label={`Increase ${field.label.toLowerCase()}`}
                className={`${stackedStepper} border-b border-input`}
                render={(props) => (
                  <button {...props} type="button">
                    <ChevronUpIcon aria-hidden="true" />
                  </button>
                )}
              />
              <NumberFieldDecrement
                aria-label={`Decrease ${field.label.toLowerCase()}`}
                className={`${stackedStepper} border-r-0`}
                render={(props) => (
                  <button {...props} type="button">
                    <ChevronDownIcon aria-hidden="true" />
                  </button>
                )}
              />
            </div>
          </NumberFieldGroup>
        </NumberField>
      ))}
    </div>
  );
}
