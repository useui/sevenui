"use client";

import { useState } from "react";

import { Slider } from "@/registry/base/ui/slider";

const sizes = [
  {
    id: "slider-02-sm",
    size: "Small",
    label: "Timeline zoom",
    hint: "Dense toolbars and inspector panels",
    defaultValue: 35,
    className:
      "[&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-track]]:h-0.5!",
  },
  {
    id: "slider-02-md",
    size: "Default",
    label: "Brush size",
    hint: "Forms and settings pages",
    defaultValue: 55,
    className: "",
  },
  {
    id: "slider-02-lg",
    size: "Large",
    label: "Playback volume",
    hint: "Touch surfaces and media controls",
    defaultValue: 70,
    className:
      "[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-track]]:h-2!",
  },
];

export default function Slider02() {
  const [values, setValues] = useState(sizes.map((item) => item.defaultValue));

  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border">
      {sizes.map((item, index) => (
        <div key={item.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span id={item.id} className="text-sm font-medium">
                {item.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.size} · {item.hint}
              </span>
            </div>
            <span
              aria-hidden="true"
              className="text-sm tabular-nums text-muted-foreground"
            >
              {values[index]}
            </span>
          </div>
          <Slider
            aria-labelledby={item.id}
            className={item.className}
            value={[values[index]]}
            onValueChange={(value) =>
              setValues((current) =>
                current.map((entry, i) =>
                  i === index
                    ? typeof value === "number"
                      ? value
                      : value[0]
                    : entry,
                ),
              )
            }
          />
        </div>
      ))}
    </div>
  );
}
