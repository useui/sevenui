"use client";

import { useId } from "react";

import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const sizes = [
  {
    key: "compact",
    size: "Compact",
    label: "Commit summary",
    placeholder: "fix(billing): round prorated seat charges to the cent",
    className: "min-h-10 rounded-md px-2 py-1 md:text-xs",
  },
  {
    key: "default",
    size: "Default",
    label: "Release note",
    placeholder: "Invoices now show prorated seat charges line by line.",
    className: "",
  },
  {
    key: "spacious",
    size: "Spacious",
    label: "Incident summary",
    placeholder:
      "Between 14:02 and 14:37 UTC, 3% of invoice exports failed because the PDF worker ran out of memory.",
    className: "min-h-28 rounded-xl px-3.5 py-3 md:text-base",
  },
] as const;

export default function Textarea01() {
  const id = useId();

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {sizes.map((item) => {
        const inputId = `${id}-${item.key}`;
        return (
          <div key={item.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor={inputId}>{item.label}</Label>
              <span className="text-xs text-muted-foreground">{item.size}</span>
            </div>
            <Textarea
              id={inputId}
              placeholder={item.placeholder}
              className={item.className}
            />
          </div>
        );
      })}
    </div>
  );
}
