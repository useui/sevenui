"use client";

import * as React from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/registry/base/ui/combobox";
import { Label } from "@/registry/base/ui/label";

const MAX_LABELS = 3;

const labels = [
  { value: "bug", label: "Bug", dotClassName: "bg-destructive" },
  { value: "performance", label: "Performance", dotClassName: "bg-chart-1" },
  { value: "design", label: "Design", dotClassName: "bg-chart-2" },
  { value: "docs", label: "Documentation", dotClassName: "bg-chart-3" },
  { value: "security", label: "Security", dotClassName: "bg-chart-4" },
  { value: "good-first-issue", label: "Good first issue", dotClassName: "bg-chart-5" },
];

type IssueLabel = (typeof labels)[number];

export default function Combobox05() {
  const anchor = useComboboxAnchor();
  const [value, setValue] = React.useState<IssueLabel[]>([labels[0], labels[1]]);
  const atLimit = value.length >= MAX_LABELS;

  return (
    <div className="grid w-full max-w-xs gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor="combobox-05-labels">Labels</Label>
        <span
          id="combobox-05-count"
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          {value.length} of {MAX_LABELS}
        </span>
      </div>
      <Combobox items={labels} multiple value={value} onValueChange={setValue}>
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(selected: IssueLabel[]) => (
              <React.Fragment>
                {selected.map((item) => (
                  <ComboboxChip
                    key={item.value}
                    aria-label={item.label}
                    className="gap-1.5 rounded-full bg-transparent pl-2 ring-1 ring-border"
                  >
                    <span
                      aria-hidden="true"
                      className={`size-1.5 rounded-full ${item.dotClassName}`}
                    />
                    {item.label}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id="combobox-05-labels"
                  aria-describedby="combobox-05-count"
                  placeholder={selected.length > 0 ? "" : "Add labels"}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No label with that name.</ComboboxEmpty>
          <ComboboxList>
            {(item: IssueLabel) => (
              <ComboboxItem
                key={item.value}
                value={item}
                disabled={
                  atLimit && !value.some((selected) => selected.value === item.value)
                }
              >
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${item.dotClassName}`}
                />
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
          {atLimit ? (
            <p className="border-t border-border px-2.5 py-2 text-xs text-muted-foreground">
              Remove a label to add another.
            </p>
          ) : null}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
