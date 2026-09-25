"use client";

import { useState } from "react";
import { RotateCcwIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";
import { Slider } from "@/registry/base/ui/slider";

const min = 0;
const max = 5000;
const step = 50;
const defaultCap = 1200;

const currencyFormat = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
} as const;

const currency = new Intl.NumberFormat("en-US", currencyFormat);

export default function NumberField07() {
  const [cap, setCap] = useState(defaultCap);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor="number-field-07" id="number-field-07-label">
            Monthly spend cap
          </Label>
          <span className="text-xs text-muted-foreground">
            API usage pauses once the cap is reached.
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Reset spend cap"
          disabled={cap === defaultCap}
          onClick={() => setCap(defaultCap)}
        >
          <RotateCcwIcon aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-2 sm:pt-3">
          <Slider
            aria-labelledby="number-field-07-label"
            min={min}
            max={max}
            step={step}
            value={[cap]}
            onValueChange={(value) =>
              setCap(typeof value === "number" ? value : value[0])
            }
          />
          <div
            aria-hidden="true"
            className="flex justify-between text-xs tabular-nums text-muted-foreground"
          >
            <span>{currency.format(min)}</span>
            <span>{currency.format(max)}</span>
          </div>
        </div>
        <NumberField
          id="number-field-07"
          value={cap}
          onValueChange={(value) => setCap(value ?? min)}
          min={min}
          max={max}
          step={step}
          largeStep={500}
          format={currencyFormat}
          className="shrink-0"
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput className="w-20" />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </div>
    </div>
  );
}
