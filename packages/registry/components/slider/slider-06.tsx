"use client";

import { useState } from "react";

import { cn } from "cn";

import { Slider } from "@/registry/base/ui/slider";

const lengths = [
  { label: "Brief", detail: "One or two sentences, straight to the answer." },
  { label: "Balanced", detail: "A short paragraph with the key reasoning." },
  { label: "Detailed", detail: "Step-by-step explanation with examples." },
  { label: "Thorough", detail: "Full walkthrough, edge cases, and sources." },
];

const last = lengths.length - 1;

export default function Slider06() {
  const [index, setIndex] = useState(1);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span id="slider-06-label" className="text-sm font-medium">
          Response length
        </span>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {lengths[index].label}:
          </span>{" "}
          {lengths[index].detail}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Slider
          aria-labelledby="slider-06-label"
          className="[&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-track]]:h-1.5!"
          min={0}
          max={last}
          step={1}
          value={[index]}
          onValueChange={(value) =>
            setIndex(typeof value === "number" ? value : value[0])
          }
        />
        {/* Ticks sit at thumb centers: half a thumb (8px) in from each edge. */}
        <div aria-hidden="true" className="flex justify-between px-[7px]">
          {lengths.map((item, i) => (
            <span
              key={item.label}
              className={cn(
                "h-1.5 w-0.5 rounded-full transition-colors",
                i <= index ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>
        {/* Edge columns are half-width so each label centers under its tick. */}
        <div className="grid grid-cols-[minmax(max-content,1fr)_2fr_2fr_minmax(max-content,1fr)] text-xs">
          {lengths.map((item, i) => (
            <button
              key={item.label}
              type="button"
              aria-label={`Set response length to ${item.label}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "whitespace-nowrap rounded-sm py-0.5 outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                i === 0 && "text-left",
                i === last && "text-right",
                i > 0 && i < last && "text-center",
                i === index
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
