"use client";

import * as React from "react";

import { ScrollArea } from "@/registry/base/ui/scroll-area";
import { Toggle } from "@/registry/base/ui/toggle";

const categories = [
  { value: "analytics", label: "Analytics", count: 18 },
  { value: "billing", label: "Billing", count: 9 },
  { value: "crm", label: "CRM", count: 14 },
  { value: "design", label: "Design", count: 11 },
  { value: "devops", label: "DevOps", count: 23 },
  { value: "email", label: "Email", count: 7 },
  { value: "messaging", label: "Messaging", count: 12 },
  { value: "payments", label: "Payments", count: 6 },
  { value: "security", label: "Security", count: 15 },
  { value: "storage", label: "Storage", count: 8 },
];

export default function ScrollArea02() {
  const [selected, setSelected] = React.useState<string[]>([
    "analytics",
    "devops",
  ]);

  const total = categories
    .filter((category) => selected.includes(category.value))
    .reduce((sum, category) => sum + category.count, 0);

  function toggle(value: string, pressed: boolean) {
    setSelected((current) =>
      pressed
        ? [...current, value]
        : current.filter((item) => item !== value),
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <span id="scroll-area-02-label" className="text-sm font-medium">
        Filter integrations
      </span>
      <ScrollArea orientation="horizontal" className="w-full">
        <fieldset
          aria-labelledby="scroll-area-02-label"
          className="m-0 flex w-max min-w-0 gap-1.5 border-0 p-0 pb-3"
        >
          {categories.map((category) => (
            <Toggle
              key={category.value}
              variant="outline"
              size="sm"
              pressed={selected.includes(category.value)}
              onPressedChange={(pressed) => toggle(category.value, pressed)}
              className="rounded-full aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {category.label}
              <span className="text-xs tabular-nums opacity-70">
                {category.count}
              </span>
            </Toggle>
          ))}
        </fieldset>
      </ScrollArea>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {selected.length === 0
          ? "Showing all 123 integrations"
          : `Showing ${total} integrations in ${selected.length} ${
              selected.length === 1 ? "category" : "categories"
            }`}
      </p>
    </div>
  );
}
