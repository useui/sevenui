"use client";

import { ChartAreaIcon, ChartColumnIcon, ChartLineIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const sizes = [
  { size: "sm", label: "Small", hint: "Dense dashboard widgets" },
  { size: "default", label: "Default", hint: "Report toolbars" },
  { size: "lg", label: "Large", hint: "Touch and kiosk screens" },
] as const;

const charts = [
  { value: "line", label: "Line", icon: ChartLineIcon },
  { value: "bar", label: "Bar", icon: ChartColumnIcon },
  { value: "area", label: "Area", icon: ChartAreaIcon },
];

export default function ToggleGroup02() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      {sizes.map((row) => (
        <div
          key={row.size}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.label}</span>
            <span className="text-xs text-muted-foreground">{row.hint}</span>
          </div>
          <ToggleGroup
            aria-label={`Chart type, ${row.label.toLowerCase()} size`}
            size={row.size}
            spacing={0.5}
            defaultValue={["bar"]}
            className="rounded-lg bg-muted p-0.5"
          >
            {charts.map((chart) => (
              <ToggleGroupItem
                key={chart.value}
                value={chart.value}
                className="text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm dark:aria-pressed:bg-input/50"
              >
                <chart.icon aria-hidden="true" />
                {chart.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ))}
    </div>
  );
}
