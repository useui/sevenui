"use client";

import { CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Slider } from "@/registry/base/ui/slider";
import { Spinner } from "@/registry/base/ui/spinner";

type SaveStatus = "idle" | "saving" | "saved";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Slider08() {
  const [cap, setCap] = useState(750);
  const [savedCap, setSavedCap] = useState(750);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      for (const timer of timers.current) clearTimeout(timer);
    };
  }, []);

  function save(next: number) {
    for (const timer of timers.current) clearTimeout(timer);
    if (next === savedCap) {
      setStatus("idle");
      return;
    }
    setStatus("saving");
    // Simulated request: settle after a short delay, then fade the badge out.
    timers.current = [
      setTimeout(() => {
        setSavedCap(next);
        setStatus("saved");
      }, 900),
      setTimeout(() => setStatus("idle"), 2900),
    ];
  }

  const dirty = cap !== savedCap;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle id="slider-08-label">Monthly spending cap</CardTitle>
        <CardDescription>
          Usage stops when this limit is reached. Changes save when you release
          the handle.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <span
            aria-hidden="true"
            className="text-3xl font-semibold tracking-tight tabular-nums"
          >
            {currency.format(cap)}
          </span>
          <span
            role="status"
            className="flex h-6 items-center gap-1.5 text-xs text-muted-foreground"
          >
            {status === "saving" && (
              <>
                <Spinner aria-hidden="true" role="presentation" className="size-3.5" />
                Saving…
              </>
            )}
            {status === "saved" && (
              <>
                <CheckIcon aria-hidden="true" className="size-3.5 text-success" />
                Saved
              </>
            )}
            {status === "idle" && dirty && "Unsaved"}
          </span>
        </div>
        <Slider
          aria-labelledby="slider-08-label"
          className="transition-opacity data-[dragging]:[&_[data-slot=slider-thumb]]:scale-125 [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:transition-[scale,box-shadow] [&_[data-slot=slider-thumb]]:duration-200 [&_[data-slot=slider-thumb]]:ease-out [&_[data-slot=slider-track]]:h-1.5!"
          min={100}
          max={2000}
          step={25}
          largeStep={250}
          value={[cap]}
          onValueChange={(value) =>
            setCap(typeof value === "number" ? value : value[0])
          }
          onValueCommitted={(value) =>
            save(typeof value === "number" ? value : value[0])
          }
        />
        <div
          aria-hidden="true"
          className="flex justify-between text-xs tabular-nums text-muted-foreground"
        >
          <span>{currency.format(100)}</span>
          <span>Last month: {currency.format(612)}</span>
          <span>{currency.format(2000)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
