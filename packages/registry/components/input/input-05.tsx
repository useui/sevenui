"use client";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const styles = [
  {
    id: "outline",
    name: "Outline",
    description: "The default. Clear edges for dense forms.",
    className: "",
  },
  {
    id: "filled",
    name: "Filled",
    description: "A tinted surface that lifts to the background on focus.",
    className:
      "border-transparent bg-muted focus-visible:bg-background dark:bg-muted dark:focus-visible:bg-input/30",
  },
  {
    id: "underline",
    name: "Underline",
    description: "A single rule for editorial, low-chrome layouts.",
    className:
      "rounded-none border-0 border-b bg-transparent px-0 focus-visible:ring-0 focus-visible:shadow-[0_1px_0_0_var(--ring)] dark:bg-transparent",
  },
] as const;

export default function Input05() {
  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border">
      {styles.map((style) => (
        <div key={style.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{style.name}</span>
            <span className="text-xs text-muted-foreground">{style.description}</span>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`input-05-${style.id}`} className="text-xs text-muted-foreground">
              Company name
            </Label>
            <Input
              id={`input-05-${style.id}`}
              placeholder="Northwind Labs"
              autoComplete="organization"
              className={style.className}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
