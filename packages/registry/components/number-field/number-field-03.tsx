"use client";

import { MoonIcon } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

const pillStepper =
  "size-8 rounded-full border-0 bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground active:scale-95 transition-[transform,background-color,color] dark:bg-accent dark:hover:bg-accent/80";

export default function NumberField03() {
  return (
    <NumberField
      id="number-field-03"
      defaultValue={3}
      min={1}
      max={28}
      className="flex w-full max-w-xs flex-row items-center justify-between gap-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MoonIcon aria-hidden="true" className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor="number-field-03">Nights</Label>
          <span className="text-xs text-muted-foreground">
            Check-in <span className="whitespace-nowrap">Fri, Mar 14</span>
          </span>
        </div>
      </div>
      <NumberFieldGroup className="h-10 shrink-0 items-center gap-1 rounded-full border-0 bg-muted p-1 shadow-none focus-within:ring-2">
        <NumberFieldDecrement className={pillStepper} />
        <NumberFieldInput className="w-8 font-medium" />
        <NumberFieldIncrement className={pillStepper} />
      </NumberFieldGroup>
    </NumberField>
  );
}
