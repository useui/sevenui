"use client";

import * as React from "react";
import { Check, ShoppingBag } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const widths = [
  { value: "standard", label: "Standard" },
  { value: "wide", label: "Wide (2E)" },
];

const sizes = [
  { value: "7", stock: 4 },
  { value: "7.5", stock: 0 },
  { value: "8", stock: 12 },
  { value: "8.5", stock: 9 },
  { value: "9", stock: 2 },
  { value: "9.5", stock: 15 },
  { value: "10", stock: 7 },
  { value: "10.5", stock: 0 },
  { value: "11", stock: 5 },
  { value: "12", stock: 1 },
];

const sizeChart = [
  { us: "7", eu: "40", cm: "25" },
  { us: "8", eu: "41", cm: "26" },
  { us: "9", eu: "42.5", cm: "27" },
  { us: "10", eu: "44", cm: "28" },
  { us: "11", eu: "45", cm: "29" },
  { us: "12", eu: "46", cm: "30" },
];

export default function ToggleGroup10() {
  const [width, setWidth] = React.useState("standard");
  const [size, setSize] = React.useState<string[]>([]);
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    if (!added) return;
    const timeout = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [added]);
  const picked = sizes.find((entry) => entry.value === size[0]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex gap-4">
        <img
          src="/placeholder.svg"
          alt="Trail runner in slate grey, side view"
          className="size-20 shrink-0 rounded-lg border border-border bg-muted object-cover"
        />
        <div className="flex flex-col gap-1">
          <h3 className="font-medium">Ridgeline Trail Runner</h3>
          <p className="text-sm text-muted-foreground">Men&apos;s · Slate grey</p>
          <p className="text-sm font-medium tabular-nums">$148.00</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span id="toggle-group-10-width" className="text-sm font-medium">
          Width
        </span>
        <ToggleGroup
          aria-labelledby="toggle-group-10-width"
          variant="outline"
          value={[width]}
          onValueChange={(next) => {
            if (next[0]) setWidth(next[0]);
          }}
          className="w-full"
        >
          {widths.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="flex-1 aria-pressed:border-foreground aria-pressed:bg-transparent"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span id="toggle-group-10-size" className="text-sm font-medium">
            Size (US)
          </span>
          <Popover>
            <PopoverTrigger className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
              Size guide
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <PopoverHeader>
                <PopoverTitle>Size guide</PopoverTitle>
                <PopoverDescription className="text-xs">
                  Measure your foot heel to toe. Runs true to size.
                </PopoverDescription>
              </PopoverHeader>
              <table className="w-full text-xs tabular-nums">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1 font-medium">US</th>
                    <th className="py-1 font-medium">EU</th>
                    <th className="py-1 font-medium">Foot (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((row) => (
                    <tr key={row.us} className="border-t border-border">
                      <td className="py-1">{row.us}</td>
                      <td className="py-1">{row.eu}</td>
                      <td className="py-1">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PopoverContent>
          </Popover>
        </div>
        <ToggleGroup
          aria-labelledby="toggle-group-10-size"
          variant="outline"
          value={size}
          onValueChange={(next) => {
            setSize(next);
            setAdded(false);
          }}
          className="grid w-full grid-cols-5"
        >
          {sizes.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              disabled={option.stock === 0}
              aria-label={
                option.stock === 0
                  ? `Size ${option.value}, sold out`
                  : `Size ${option.value}`
              }
              className="tabular-nums aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background disabled:line-through data-disabled:line-through"
            >
              {option.value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p aria-live="polite" className="min-h-4 text-xs text-muted-foreground">
          {picked
            ? picked.stock <= 2
              ? `Only ${picked.stock} left in size ${picked.value}. Order soon.`
              : `Size ${picked.value} ships in 1-2 business days.`
            : "Select a size to see delivery time."}
        </p>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!picked}
        onClick={() => setAdded(true)}
      >
        {added ? (
          <Check aria-hidden="true" />
        ) : (
          <ShoppingBag aria-hidden="true" />
        )}
        {added ? "Added to bag" : "Add to bag"}
      </Button>
      <span aria-live="polite" className="sr-only">
        {added && picked ? `Size ${picked.value} added to your bag.` : ""}
      </span>
    </div>
  );
}
