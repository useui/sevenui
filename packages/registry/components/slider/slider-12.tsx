"use client";

import {
  ContrastIcon,
  DropletIcon,
  RotateCcwIcon,
  SunIcon,
  ThermometerIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Slider } from "@/registry/base/ui/slider";

type AdjustmentKey = "exposure" | "contrast" | "saturation" | "warmth";

const adjustments: {
  key: AdjustmentKey;
  label: string;
  icon: typeof SunIcon;
}[] = [
  { key: "exposure", label: "Exposure", icon: SunIcon },
  { key: "contrast", label: "Contrast", icon: ContrastIcon },
  { key: "saturation", label: "Saturation", icon: DropletIcon },
  { key: "warmth", label: "Warmth", icon: ThermometerIcon },
];

const neutral: Record<AdjustmentKey, number> = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
};

function toFilter(values: Record<AdjustmentKey, number>) {
  return [
    `brightness(${1 + values.exposure / 200})`,
    `contrast(${1 + values.contrast / 150})`,
    `saturate(${1 + values.saturation / 100})`,
    `sepia(${Math.max(values.warmth, 0) / 250})`,
    `hue-rotate(${Math.min(values.warmth, 0) / 5}deg)`,
  ].join(" ");
}

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export default function Slider12() {
  const [values, setValues] = useState(neutral);
  const [showOriginal, setShowOriginal] = useState(false);

  const edited = adjustments.some(({ key }) => values[key] !== 0);

  return (
    <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src="/placeholder.svg"
          alt="Harbor at sunset, with current adjustments applied"
          className="size-full object-cover transition-[filter] duration-150"
          style={{ filter: showOriginal ? "none" : toFilter(values) }}
        />
        <Button
          variant="secondary"
          size="xs"
          className="absolute right-2 bottom-2 shadow-sm"
          disabled={!edited}
          aria-pressed={showOriginal}
          onPointerDown={() => setShowOriginal(true)}
          onPointerUp={() => setShowOriginal(false)}
          onPointerLeave={() => setShowOriginal(false)}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter")
              setShowOriginal(true);
          }}
          onKeyUp={() => setShowOriginal(false)}
          onBlur={() => setShowOriginal(false)}
        >
          Hold to compare
        </Button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Adjust</h3>
          <Button
            variant="ghost"
            size="xs"
            disabled={!edited}
            onClick={() => setValues(neutral)}
          >
            Reset all
          </Button>
        </div>

        {adjustments.map(({ key, label, icon: Icon }) => {
          const value = values[key];
          const labelId = `slider-12-${key}`;
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Icon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                <span id={labelId} className="font-medium">
                  {label}
                </span>
                <span
                  className={`ml-auto text-xs tabular-nums ${value === 0 ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {formatSigned(value)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Reset ${label.toLowerCase()}`}
                  disabled={value === 0}
                  onClick={() =>
                    setValues((current) => ({ ...current, [key]: 0 }))
                  }
                >
                  <RotateCcwIcon aria-hidden="true" />
                </Button>
              </div>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-1/2 h-2.5 w-px -translate-y-1/2 bg-foreground/25"
                />
                <Slider
                  aria-labelledby={labelId}
                  value={[value]}
                  min={-100}
                  max={100}
                  step={1}
                  largeStep={10}
                  onValueChange={(next) =>
                    setValues((current) => ({
                      ...current,
                      [key]: Array.isArray(next) ? (next[0] ?? 0) : next,
                    }))
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
