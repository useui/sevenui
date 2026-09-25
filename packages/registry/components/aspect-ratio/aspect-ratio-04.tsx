"use client";

import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

// Tallest the preview may grow, in pixels, so portrait ratios stay compact.
const MAX_PREVIEW_HEIGHT = 220;

const named: { ratio: number; name: string }[] = [
  { ratio: 1, name: "Square" },
  { ratio: 4 / 3, name: "Standard" },
  { ratio: 3 / 2, name: "Classic photo" },
  { ratio: 16 / 9, name: "Widescreen" },
  { ratio: 21 / 9, name: "Ultrawide" },
  { ratio: 4 / 5, name: "Portrait post" },
  { ratio: 9 / 16, name: "Vertical story" },
];

function describe(ratio: number) {
  const match = named.find((item) => Math.abs(item.ratio - ratio) < 0.01);
  return match ? match.name : "Custom";
}

export default function AspectRatio04() {
  const [width, setWidth] = React.useState(16);
  const [height, setHeight] = React.useState(9);
  const ratio = width / height;

  const fields = [
    { id: "aspect-ratio-04-width", label: "Width", value: width, set: setWidth },
    {
      id: "aspect-ratio-04-height",
      label: "Height",
      value: height,
      set: setHeight,
    },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <NumberField
              id={field.id}
              min={1}
              max={32}
              value={field.value}
              onValueChange={(next) => field.set(next ?? 1)}
            >
              <NumberFieldGroup>
                <NumberFieldDecrement />
                <NumberFieldInput className="w-12" />
                <NumberFieldIncrement />
              </NumberFieldGroup>
            </NumberField>
          </div>
        ))}
        <p className="ml-auto flex flex-col items-end text-right" aria-live="polite">
          <span className="text-sm font-medium tabular-nums">
            {ratio.toFixed(2)} : 1
          </span>
          <span className="text-xs text-muted-foreground">
            {describe(ratio)}
          </span>
        </p>
      </div>
      <div
        className="mx-auto w-full transition-[max-width] duration-300 ease-out motion-reduce:transition-none"
        style={{ maxWidth: `${MAX_PREVIEW_HEIGHT * ratio}px` }}
      >
        <AspectRatio
          ratio={ratio}
          className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/50"
        >
          <span className="text-xs tabular-nums text-muted-foreground">
            {width} × {height}
          </span>
        </AspectRatio>
      </div>
    </div>
  );
}
