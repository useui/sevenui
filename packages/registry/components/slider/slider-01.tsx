"use client";

import { useState } from "react";

import { Label } from "@/registry/base/ui/label";
import { Slider } from "@/registry/base/ui/slider";

export default function Slider01() {
  const [opacity, setOpacity] = useState(72);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <Label id="slider-01-label">Layer opacity</Label>
        <span
          aria-hidden="true"
          className="text-sm font-medium tabular-nums text-muted-foreground"
        >
          {opacity}%
        </span>
      </div>
      <Slider
        aria-labelledby="slider-01-label"
        value={[opacity]}
        onValueChange={(value) =>
          setOpacity(typeof value === "number" ? value : value[0])
        }
      />
      <div
        aria-hidden="true"
        className="flex justify-between text-xs tabular-nums text-muted-foreground"
      >
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
