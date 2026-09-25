"use client";

import { useState } from "react";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Slider } from "@/registry/base/ui/slider";

const MIN = 0;
const MAX = 2000;
const STEP = 50;
const MIN_GAP_STEPS = 2;
const GAP = STEP * MIN_GAP_STEPS;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Slider04() {
  const [range, setRange] = useState<[number, number]>([400, 1200]);
  const [drafts, setDrafts] = useState(["400", "1200"]);

  function applyRange(next: [number, number]) {
    setRange(next);
    setDrafts([String(next[0]), String(next[1])]);
  }

  function commitDraft(index: 0 | 1) {
    const parsed = Math.round(Number(drafts[index]) / STEP) * STEP;
    if (drafts[index].trim() === "" || Number.isNaN(parsed)) {
      applyRange(range);
      return;
    }
    if (index === 0) {
      applyRange([Math.min(Math.max(MIN, parsed), range[1] - GAP), range[1]]);
    } else {
      applyRange([range[0], Math.max(Math.min(MAX, parsed), range[0] + GAP)]);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <span id="slider-04-label" className="text-sm font-medium">
          Project budget
        </span>
        <span
          aria-hidden="true"
          className="text-sm tabular-nums text-muted-foreground"
        >
          {currency.format(range[0])} – {currency.format(range[1])}
        </span>
      </div>
      <Slider
        aria-labelledby="slider-04-label"
        min={MIN}
        max={MAX}
        step={STEP}
        minStepsBetweenValues={MIN_GAP_STEPS}
        value={range}
        onValueChange={(value) => {
          if (typeof value !== "number") applyRange([value[0], value[1]]);
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        {(["Minimum", "Maximum"] as const).map((label, i) => {
          const index = i as 0 | 1;
          const id = `slider-04-${label.toLowerCase()}`;
          return (
            <div key={label} className="flex flex-col gap-1.5">
              <Label htmlFor={id} className="text-xs text-muted-foreground">
                {label}
              </Label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground"
                >
                  $
                </span>
                <Input
                  id={id}
                  inputMode="numeric"
                  className="pl-6 tabular-nums"
                  value={drafts[index]}
                  onChange={(event) =>
                    setDrafts((current) =>
                      current.map((draft, j) =>
                        j === index ? event.target.value : draft,
                      ),
                    )
                  }
                  onBlur={() => commitDraft(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commitDraft(index);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-pretty text-xs text-muted-foreground">
        Rounded to the nearest {currency.format(STEP)}, with at least{" "}
        {currency.format(GAP)} between the two limits.
      </p>
    </div>
  );
}
