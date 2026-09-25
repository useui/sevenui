"use client";

import * as React from "react";
import { cn } from "cn";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Density = "compact" | "default" | "comfortable";

const densities: { value: Density; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "comfortable", label: "Comfortable" },
];

const styles: Record<Density, { stack: string; label: string; input: string }> =
  {
    compact: {
      stack: "gap-1",
      label: "text-xs",
      input: "h-7 text-xs md:text-xs",
    },
    default: { stack: "gap-2", label: "text-sm", input: "h-8" },
    comfortable: {
      stack: "gap-2.5",
      label: "text-base",
      input: "h-10 px-3 text-base md:text-base",
    },
  };

const fields = [
  { id: "sku", label: "SKU", placeholder: "TEE-BLK-M" },
  {
    id: "stock",
    label: "Units in stock",
    placeholder: "148",
    inputMode: "numeric" as const,
  },
];

export default function Label05() {
  const [density, setDensity] = React.useState<Density>("default");
  const style = styles[density];

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-label="Form density"
        value={[density]}
        onValueChange={(value) => {
          const next = value[0] as Density | undefined;
          if (next) setDensity(next);
        }}
        className="w-full"
      >
        {densities.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className="flex-1"
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div
        className={cn(
          "grid grid-cols-2",
          density === "compact" ? "gap-2" : "gap-4",
        )}
      >
        {fields.map((field) => (
          <div key={field.id} className={cn("flex flex-col", style.stack)}>
            <Label htmlFor={`label-05-${field.id}`} className={style.label}>
              {field.label}
            </Label>
            <Input
              id={`label-05-${field.id}`}
              placeholder={field.placeholder}
              inputMode={"inputMode" in field ? field.inputMode : undefined}
              className={style.input}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
