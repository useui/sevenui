"use client";

import * as React from "react";

import { CheckIcon, XIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";

type IssueLabel = { value: string; label: string; dot: string };

const labels: IssueLabel[] = [
  { value: "bug", label: "Bug", dot: "bg-destructive" },
  { value: "feature", label: "Feature request", dot: "bg-chart-1" },
  { value: "performance", label: "Performance", dot: "bg-chart-2" },
  { value: "accessibility", label: "Accessibility", dot: "bg-chart-3" },
  { value: "docs", label: "Documentation", dot: "bg-chart-4" },
  { value: "design", label: "Design", dot: "bg-chart-5" },
  { value: "regression", label: "Regression", dot: "bg-warning" },
  { value: "good-first-issue", label: "Good first issue", dot: "bg-success" },
];

export default function Command06() {
  const [selected, setSelected] = React.useState<string[]>(["bug", "performance"]);

  function toggle(value: string) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  const chosen = labels.filter((label) => selected.includes(label.value));

  return (
    <Command items={labels} className="w-full max-w-xs border border-border shadow-md">
      <div className="flex min-h-9 flex-wrap items-center gap-1 px-2 pt-1.5 pb-1">
        {chosen.length === 0 ? (
          <span className="text-xs text-muted-foreground">No labels applied</span>
        ) : (
          chosen.map((label) => (
            <Badge key={label.value} variant="outline" className="gap-1.5 pr-0.5">
              <span aria-hidden="true" className={`size-1.5 rounded-full ${label.dot}`} />
              {label.label}
              <button
                type="button"
                aria-label={`Remove ${label.label}`}
                onClick={() => toggle(label.value)}
                className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <XIcon aria-hidden="true" />
              </button>
            </Badge>
          ))
        )}
      </div>
      <CommandInput placeholder="Filter labels..." aria-label="Filter labels" />
      <CommandList aria-multiselectable="true" className="mt-1 max-h-64">
        {(label: IssueLabel) => {
          const isSelected = selected.includes(label.value);
          return (
            <CommandItem
              key={label.value}
              value={label}
              aria-selected={isSelected}
              onClick={() => toggle(label.value)}
            >
              <span
                aria-hidden="true"
                data-checked={isSelected ? "" : undefined}
                className="flex size-4 items-center justify-center rounded-[4px] border border-input transition-colors data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground"
              >
                <CheckIcon
                  className="size-3 scale-50 opacity-0 transition-[opacity,scale] duration-150 ease-out in-data-checked:scale-100 in-data-checked:opacity-100"
                />
              </span>
              <span aria-hidden="true" className={`size-2 rounded-full ${label.dot}`} />
              {label.label}
            </CommandItem>
          );
        }}
      </CommandList>
      <CommandEmpty>No label with that name.</CommandEmpty>
      <div className="mt-1 flex items-center justify-between border-t border-border px-2 pt-1.5 pb-0.5">
        <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {selected.length} of {labels.length} selected
        </span>
        <Button
          size="xs"
          variant="ghost"
          disabled={selected.length === 0}
          onClick={() => setSelected([])}
        >
          Clear
        </Button>
      </div>
    </Command>
  );
}
