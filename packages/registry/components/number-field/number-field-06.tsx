"use client";

import { RotateCwIcon } from "lucide-react";

import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/registry/base/ui/number-field";

const properties = [
  { id: "x", handle: "X", label: "X position", value: 240, suffix: "px" },
  { id: "y", handle: "Y", label: "Y position", value: 128, suffix: "px" },
  { id: "w", handle: "W", label: "Width", value: 360, suffix: "px", min: 1 },
  { id: "h", handle: "H", label: "Height", value: 212, suffix: "px", min: 1 },
];

export default function NumberField06() {
  return (
    <section
      aria-labelledby="number-field-06-title"
      className="w-full max-w-xs rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 id="number-field-06-title" className="text-sm font-medium">
          Frame
        </h3>
        <p className="text-xs text-muted-foreground">Drag a letter to scrub</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {properties.map((property) => {
          const id = `number-field-06-${property.id}`;
          return (
            <NumberField
              key={property.id}
              id={id}
              defaultValue={property.value}
              min={property.min}
              largeStep={10}
            >
              <NumberFieldGroup className="h-8 w-full bg-muted/40 shadow-none">
                <NumberFieldScrubArea className="flex w-7 shrink-0 items-center justify-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-scrubbing:bg-muted data-scrubbing:text-foreground">
                  <label htmlFor={id} className="cursor-ew-resize">
                    {property.handle}
                  </label>
                </NumberFieldScrubArea>
                <NumberFieldInput
                  aria-label={property.label}
                  className="w-0 min-w-0 flex-1 text-left text-xs"
                />
                <span
                  aria-hidden="true"
                  className="flex items-center pr-2 text-xs text-muted-foreground"
                >
                  {property.suffix}
                </span>
              </NumberFieldGroup>
            </NumberField>
          );
        })}
        <NumberField
          id="number-field-06-rotation"
          defaultValue={15}
          min={-180}
          max={180}
          largeStep={45}
          className="col-span-2"
        >
          <NumberFieldGroup className="h-8 w-full bg-muted/40 shadow-none">
            <NumberFieldScrubArea className="flex w-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground data-scrubbing:bg-muted data-scrubbing:text-foreground">
              <label
                htmlFor="number-field-06-rotation"
                className="cursor-ew-resize"
              >
                <RotateCwIcon aria-hidden="true" className="size-3.5" />
                <span className="sr-only">Rotation</span>
              </label>
            </NumberFieldScrubArea>
            <NumberFieldInput className="w-0 min-w-0 flex-1 text-left text-xs" />
            <span
              aria-hidden="true"
              className="flex items-center pr-2 text-xs text-muted-foreground"
            >
              deg
            </span>
          </NumberFieldGroup>
        </NumberField>
      </div>
    </section>
  );
}
