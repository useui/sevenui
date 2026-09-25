"use client";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const sizes = [
  {
    label: "Compact",
    hint: "Table rows and dense lists",
    value: 42,
    className: "[&>[data-slot=progress-track]]:h-1",
  },
  {
    label: "Default",
    hint: "Forms, cards, and settings",
    value: 64,
    className: "[&>[data-slot=progress-track]]:h-2",
  },
  {
    label: "Large",
    hint: "Installs and full-page tasks",
    value: 86,
    className: "[&>[data-slot=progress-track]]:h-3",
  },
];

export default function Progress01() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {sizes.map((size) => (
        <Progress
          key={size.label}
          value={size.value}
          className={size.className}
        >
          <div className="flex w-full items-baseline gap-2">
            <ProgressLabel>{size.label}</ProgressLabel>
            <span className="truncate text-xs text-muted-foreground">
              {size.hint}
            </span>
            <ProgressValue />
          </div>
        </Progress>
      ))}
    </div>
  );
}
