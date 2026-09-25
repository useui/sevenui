"use client";

import { Package, Plane, Truck } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const options = [
  {
    value: "standard",
    icon: Package,
    title: "Standard",
    detail: "5–7 days",
    price: "Free",
  },
  {
    value: "express",
    icon: Truck,
    title: "Express",
    detail: "2–3 days",
    price: "$9",
  },
  {
    value: "overnight",
    icon: Plane,
    title: "Overnight",
    detail: "Next day",
    price: "$24",
  },
];

export default function Label06() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <p id="label-06-heading" className="text-sm font-medium">
        Delivery speed
      </p>
      <RadioGroup
        aria-labelledby="label-06-heading"
        defaultValue="express"
        className="grid grid-cols-3 gap-2"
      >
        {options.map((option) => (
          <Label
            key={option.value}
            className="relative cursor-pointer flex-col items-start gap-3 rounded-lg border border-border bg-card p-3 leading-normal transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
          >
            <RadioGroupItem
              value={option.value}
              className="absolute top-3 right-3"
            />
            <option.icon
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
            <span className="flex flex-col gap-0.5">
              <span>{option.title}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {option.detail}
              </span>
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {option.price}
            </span>
          </Label>
        ))}
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        Overnight orders must be placed before 2 pm local time.
      </p>
    </div>
  );
}
