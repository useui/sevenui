"use client";

import { Spinner } from "@/registry/base/ui/spinner";

const weights = [
  { name: "Hairline", strokeWidth: 1 },
  { name: "Regular", strokeWidth: 2 },
  { name: "Bold", strokeWidth: 3 },
];

export default function Spinner03() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Stroke weight</p>
        <ul className="flex items-center justify-between gap-4">
          {weights.map((weight) => (
            <li key={weight.name} className="flex flex-col items-center gap-2">
              <Spinner
                aria-label={`Loading, ${weight.name.toLowerCase()} stroke`}
                strokeWidth={weight.strokeWidth}
                className="size-7"
              />
              <span className="text-xs text-muted-foreground">
                {weight.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">With track</p>
        <ul className="flex items-end justify-between gap-4">
          <li className="flex flex-col items-center gap-2">
            <span className="relative flex size-7 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-[2.5px] rounded-full border-2 border-muted"
              />
              <Spinner
                aria-label="Loading, subtle track"
                className="relative size-7"
              />
            </span>
            <span className="text-xs text-muted-foreground">Subtle</span>
          </li>
          <li className="flex flex-col items-center gap-2">
            <span className="relative flex size-7 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-[2.5px] rounded-full border-2 border-primary/20"
              />
              <Spinner
                aria-label="Loading, primary track"
                className="relative size-7 text-primary"
              />
            </span>
            <span className="text-xs text-muted-foreground">Primary</span>
          </li>
          <li className="flex flex-col items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Spinner aria-label="Loading, filled" className="size-5" />
            </span>
            <span className="text-xs text-muted-foreground">Filled</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
