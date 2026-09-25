"use client";

import { PercentIcon, ScaleIcon } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

const affixClasses =
  "flex shrink-0 items-center px-3 text-sm text-muted-foreground [&_svg]:size-4";

export default function NumberField04() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <NumberField
        id="number-field-04-price"
        defaultValue={49}
        min={0}
        step={1}
        largeStep={10}
        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
      >
        <Label htmlFor="number-field-04-price">Unit price</Label>
        <NumberFieldGroup className="w-full">
          <span aria-hidden="true" className={`${affixClasses} pr-1`}>
            $
          </span>
          <NumberFieldInput className="min-w-0 flex-1 text-left" />
          <span aria-hidden="true" className={`${affixClasses} text-xs`}>
            USD
          </span>
          <NumberFieldDecrement aria-label="Decrease unit price" />
          <NumberFieldIncrement aria-label="Increase unit price" />
        </NumberFieldGroup>
      </NumberField>

      <NumberField
        id="number-field-04-weight"
        defaultValue={2.4}
        min={0}
        max={30}
        step={0.1}
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
      >
        <Label htmlFor="number-field-04-weight">Parcel weight</Label>
        <NumberFieldGroup className="w-full">
          <span
            aria-hidden="true"
            className={`${affixClasses} border-r border-input bg-muted/50`}
          >
            <ScaleIcon />
          </span>
          <NumberFieldInput className="min-w-0 flex-1 pl-3 text-left" />
          <span aria-hidden="true" className={affixClasses}>
            kg
          </span>
          <NumberFieldDecrement aria-label="Decrease parcel weight" />
          <NumberFieldIncrement aria-label="Increase parcel weight" />
        </NumberFieldGroup>
      </NumberField>

      <NumberField
        id="number-field-04-discount"
        defaultValue={15}
        min={0}
        max={100}
        step={5}
      >
        <Label htmlFor="number-field-04-discount">Promo discount</Label>
        <NumberFieldGroup className="w-full">
          <NumberFieldInput className="min-w-0 flex-1 pl-3 text-left" />
          <span
            aria-hidden="true"
            className={`${affixClasses} border-l border-input bg-muted/50`}
          >
            <PercentIcon />
          </span>
          <NumberFieldDecrement aria-label="Decrease promo discount" />
          <NumberFieldIncrement aria-label="Increase promo discount" />
        </NumberFieldGroup>
      </NumberField>
    </div>
  );
}
