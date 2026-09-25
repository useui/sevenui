"use client";

import { useMemo, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Slider } from "@/registry/base/ui/slider";

const PRICE_MIN = 0;
const PRICE_MAX = 400;

const products = [
  { name: "Trail runner GTX", price: 149 },
  { name: "Merino base layer", price: 68 },
  { name: "Packable rain shell", price: 219 },
  { name: "Insulated vest", price: 129 },
  { name: "Hiking socks, 3-pack", price: 24 },
  { name: "Down parka", price: 349 },
  { name: "Softshell pants", price: 98 },
  { name: "Approach shoes", price: 165 },
  { name: "Fleece quarter-zip", price: 79 },
  { name: "Waterproof gaiters", price: 45 },
  { name: "Alpine hardshell", price: 389 },
  { name: "Trucker cap", price: 32 },
];

const presets = [
  { label: "Under $50", range: [0, 50] },
  { label: "$50 to $150", range: [50, 150] },
  { label: "$150+", range: [150, PRICE_MAX] },
] as const;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Slider09() {
  const [range, setRange] = useState<[number, number]>([40, 240]);
  // The range the product grid currently shows; "Show" applies the draft.
  const [applied, setApplied] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [low, high] = range;

  const matches = useMemo(
    () =>
      products.filter(
        (product) => product.price >= low && product.price <= high,
      ).length,
    [low, high],
  );

  const isDefault = low === PRICE_MIN && high === PRICE_MAX;
  const isApplied = low === applied[0] && high === applied[1];

  return (
    <section
      aria-labelledby="slider-09-heading"
      className="flex w-full max-w-xs flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 id="slider-09-heading" className="text-sm font-medium">
            Price
          </h3>
          <p
            aria-hidden="true"
            className="text-xs tabular-nums text-muted-foreground"
          >
            {currency.format(low)} –{" "}
            {high === PRICE_MAX
              ? `${currency.format(PRICE_MAX)}+`
              : currency.format(high)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="xs"
          disabled={isDefault}
          onClick={() => setRange([PRICE_MIN, PRICE_MAX])}
        >
          Clear
        </Button>
      </div>

      <Slider
        aria-labelledby="slider-09-heading"
        value={range}
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={5}
        minStepsBetweenValues={2}
        format={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
        onValueChange={(value) => {
          if (Array.isArray(value)) setRange([value[0], value[1]]);
        }}
      />

      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const active = low === preset.range[0] && high === preset.range[1];
          return (
            <Button
              key={preset.label}
              variant={active ? "secondary" : "outline"}
              size="xs"
              aria-pressed={active}
              onClick={() => setRange([preset.range[0], preset.range[1]])}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      <Button
        disabled={matches === 0 || isApplied}
        className="w-full"
        onClick={() => setApplied([low, high])}
      >
        {matches === 0
          ? "No products in this range"
          : `${isApplied ? "Showing" : "Show"} ${matches} ${matches === 1 ? "product" : "products"}`}
      </Button>
    </section>
  );
}
