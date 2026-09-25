"use client";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

// Each size keeps the hit area generous; only the visible box changes.
const sizes = [
  {
    id: "checkbox-02-sm",
    label: "Select row",
    usage: "Small, for dense tables",
    className: "size-3.5 rounded-[3px] [&_svg]:size-3!",
    labelClassName: "text-xs",
  },
  {
    id: "checkbox-02-default",
    label: "Remember this device",
    usage: "Default, for forms and settings",
    className: "",
    labelClassName: "text-sm",
  },
  {
    id: "checkbox-02-lg",
    label: "Add oat milk to the list",
    usage: "Large, for touch-first screens",
    className: "size-5 rounded-md [&_svg]:size-4!",
    labelClassName: "text-base",
  },
];

export default function Checkbox02() {
  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {sizes.map((size) => (
        <div key={size.id} className="flex items-center gap-3 px-4 py-3.5">
          <Checkbox
            id={size.id}
            defaultChecked
            className={size.className}
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Label htmlFor={size.id} className={size.labelClassName}>
              {size.label}
            </Label>
            <span className="text-xs text-muted-foreground">{size.usage}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
