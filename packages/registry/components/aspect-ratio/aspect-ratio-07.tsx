"use client";

import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Slider } from "@/registry/base/ui/slider";

export default function AspectRatio07() {
  const [position, setPosition] = React.useState(50);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <AspectRatio
        ratio={3 / 2}
        className="overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10"
      >
        <img
          src="/placeholder.svg"
          alt="Living room after color grading, warm and balanced"
          className="absolute inset-0 size-full object-cover"
        />
        <img
          src="/placeholder.svg"
          alt="Living room before color grading, flat and desaturated"
          className="absolute inset-0 size-full object-cover grayscale"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-background shadow-sm"
          style={{ left: `${position}%` }}
        />
        <span className="absolute top-3 left-3 rounded-md bg-background/85 px-2 py-0.5 text-xs font-medium text-foreground">
          Before
        </span>
        <span className="absolute top-3 right-3 rounded-md bg-background/85 px-2 py-0.5 text-xs font-medium text-foreground">
          After
        </span>
      </AspectRatio>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span id="aspect-ratio-07-label" className="text-sm font-medium">
            Compare edit
          </span>
          <span
            aria-hidden="true"
            className="text-sm tabular-nums text-muted-foreground"
          >
            {position}% original
          </span>
        </div>
        <Slider
          aria-labelledby="aspect-ratio-07-label"
          value={[position]}
          onValueChange={(value) =>
            setPosition(typeof value === "number" ? value : value[0])
          }
        />
      </div>
    </div>
  );
}
