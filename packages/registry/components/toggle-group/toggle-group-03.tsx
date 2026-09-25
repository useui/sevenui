"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const labels = [
  { value: "bug", label: "Bug", count: 12 },
  { value: "feature", label: "Feature", count: 8 },
  { value: "performance", label: "Performance", count: 5 },
  { value: "docs", label: "Docs", count: 3 },
  { value: "security", label: "Security", count: 2 },
];

export default function ToggleGroup03() {
  const [selected, setSelected] = React.useState<string[]>(["bug", "docs"]);
  const total = labels
    .filter((item) => selected.includes(item.value))
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span id="label-filter" className="text-sm font-medium">
          Filter by label
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={selected.length === 0}
          onClick={() => setSelected([])}
        >
          Clear
        </Button>
      </div>
      <ToggleGroup
        aria-labelledby="label-filter"
        multiple
        variant="outline"
        size="sm"
        value={selected}
        onValueChange={setSelected}
        className="w-full flex-wrap"
      >
        {labels.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className="rounded-full px-3 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-foreground"
          >
            <CheckIcon
              aria-hidden="true"
              className="-ml-0.5 hidden group-aria-pressed/toggle:block"
            />
            {item.label}
            <span className="text-muted-foreground tabular-nums">
              {item.count}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {selected.length === 0
          ? "Showing all 30 open issues."
          : `Showing ${total} of 30 open issues.`}
      </p>
    </div>
  );
}
