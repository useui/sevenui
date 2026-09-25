"use client";

import { RotateCcwIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Slider } from "@/registry/base/ui/slider";

const bands = [
  { id: "slider-07-60", label: "60 Hz", name: "Sub bass", defaultGain: 4 },
  { id: "slider-07-250", label: "250 Hz", name: "Bass", defaultGain: 2 },
  { id: "slider-07-1k", label: "1 kHz", name: "Mids", defaultGain: 0 },
  { id: "slider-07-4k", label: "4 kHz", name: "Presence", defaultGain: -2 },
  { id: "slider-07-12k", label: "12 kHz", name: "Air", defaultGain: 3 },
];

const flat = bands.map(() => 0);

function formatGain(gain: number) {
  return `${gain > 0 ? "+" : ""}${gain} dB`;
}

export default function Slider07() {
  const [gains, setGains] = useState(bands.map((band) => band.defaultGain));
  const isFlat = gains.every((gain) => gain === 0);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Equalizer</span>
          <span className="text-xs text-muted-foreground">
            −12 to +12 dB per band
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isFlat}
          onClick={() => setGains(flat)}
        >
          <RotateCcwIcon aria-hidden="true" />
          Flat
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {bands.map((band, index) => (
          <div key={band.id} className="flex flex-col items-center gap-2">
            <span
              aria-hidden="true"
              className="text-xs font-medium tabular-nums"
            >
              {formatGain(gains[index])}
            </span>
            <div className="flex h-40 justify-center">
              <Slider
                aria-labelledby={band.id}
                orientation="vertical"
                className="[&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-track]]:w-1.5!"
                min={-12}
                max={12}
                step={1}
                value={[gains[index]]}
                onValueChange={(value) =>
                  setGains((current) =>
                    current.map((gain, i) =>
                      i === index
                        ? typeof value === "number"
                          ? value
                          : value[0]
                        : gain,
                    ),
                  )
                }
              />
            </div>
            <span id={band.id} className="flex flex-col items-center text-center">
              <span className="text-xs tabular-nums">{band.label}</span>
              <span className="sr-only">, {band.name}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
