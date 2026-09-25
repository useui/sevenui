"use client";

import { X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const labelGroups = [
  {
    label: "Type",
    labels: [
      { value: "bug", label: "Bug", dotClassName: "bg-destructive" },
      { value: "feature", label: "Feature request", dotClassName: "bg-chart-1" },
      { value: "docs", label: "Documentation", dotClassName: "bg-chart-2" },
    ],
  },
  {
    label: "Area",
    labels: [
      { value: "performance", label: "Performance", dotClassName: "bg-chart-3" },
      { value: "accessibility", label: "Accessibility", dotClassName: "bg-chart-4" },
      { value: "billing", label: "Billing", dotClassName: "bg-chart-5" },
    ],
  },
];

const labels = labelGroups.flatMap((group) => group.labels);

function findLabel(value: string) {
  return labels.find((item) => item.value === value);
}

function LabelDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`size-2 shrink-0 rounded-full ${className ?? ""}`}
    />
  );
}

export default function Select09() {
  const [value, setValue] = React.useState<string[]>([
    "bug",
    "performance",
  ]);

  function remove(label: string) {
    setValue((current) => current.filter((item) => item !== label));
  }

  return (
    <div className="grid w-full max-w-sm gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="select-09-labels">Labels</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value.length} of {labels.length}
        </span>
      </div>
      <Select multiple items={labels} value={value} onValueChange={setValue}>
        <SelectTrigger id="select-09-labels" className="w-full">
          <SelectValue>
            {(selected: string[]) => {
              if (selected.length === 0) {
                return (
                  <span className="text-muted-foreground">
                    Add labels
                  </span>
                );
              }
              const [first, ...rest] = selected;
              const firstLabel = findLabel(first);
              return (
                <>
                  <LabelDot className={firstLabel?.dotClassName} />
                  <span className="truncate">{firstLabel?.label ?? first}</span>
                  {rest.length > 0 && (
                    <span className="text-muted-foreground">
                      +{rest.length} more
                    </span>
                  )}
                </>
              );
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {labelGroups.map((group, index) => (
            <React.Fragment key={group.label}>
              {index > 0 && <SelectSeparator />}
              <SelectGroup>
                <SelectLabel>{group.label}</SelectLabel>
                {group.labels.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <LabelDot className={item.dotClassName} />
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
      {value.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <ul aria-label="Applied labels" className="contents">
            {value.map((selectedValue) => {
              const item = findLabel(selectedValue);
              const name = item?.label ?? selectedValue;
              return (
              <li key={selectedValue}>
                <Badge variant="outline" className="h-6 gap-1.5 pr-0.5">
                  <LabelDot className={item?.dotClassName} />
                  {name}
                  <button
                    type="button"
                    onClick={() => remove(selectedValue)}
                    aria-label={`Remove ${name}`}
                    className="flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              </li>
              );
            })}
          </ul>
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={() => setValue([])}
          >
            Clear all
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No labels yet. Unlabeled issues go to the triage queue.
        </p>
      )}
    </div>
  );
}
