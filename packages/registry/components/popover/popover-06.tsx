"use client";

import * as React from "react";
import { ListFilterIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { Separator } from "@/registry/base/ui/separator";
import { Slider } from "@/registry/base/ui/slider";

type Filters = { statuses: string[]; minScore: number };

const statuses = [
  { value: "open", label: "Open", count: 24 },
  { value: "in-review", label: "In review", count: 9 },
  { value: "blocked", label: "Blocked", count: 3 },
  { value: "done", label: "Done", count: 58 },
];

const defaults: Filters = { statuses: ["open", "in-review"], minScore: 0 };

function countActive(filters: Filters) {
  return filters.statuses.length + (filters.minScore > 0 ? 1 : 0);
}

export default function Popover06() {
  const [open, setOpen] = React.useState(false);
  const [applied, setApplied] = React.useState<Filters>(defaults);
  const [draft, setDraft] = React.useState<Filters>(defaults);
  const activeCount = countActive(applied);

  function toggleStatus(value: string, checked: boolean) {
    setDraft((current) => ({
      ...current,
      statuses: checked
        ? [...current.statuses, value]
        : current.statuses.filter((item) => item !== value),
    }));
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        // Unapplied edits are discarded when the popover closes.
        if (nextOpen) setDraft(applied);
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger
        render={<Button variant="outline" aria-label={`Filters, ${activeCount} active`} />}
      >
        <ListFilterIcon aria-hidden="true" />
        Filters
        {activeCount > 0 ? (
          <Badge variant="secondary" className="h-4.5 min-w-4.5 px-1 tabular-nums">
            {activeCount}
          </Badge>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 p-0">
        <PopoverHeader className="px-4 pt-4 pb-3">
          <PopoverTitle>Filter issues</PopoverTitle>
        </PopoverHeader>
        <fieldset className="flex flex-col gap-2.5 px-4 pb-4">
          <legend className="mb-2.5 text-xs font-medium text-muted-foreground">
            Status
          </legend>
          {statuses.map((status) => {
            const id = `popover-06-${status.value}`;
            return (
              <div key={status.value} className="flex items-center gap-2.5">
                <Checkbox
                  id={id}
                  checked={draft.statuses.includes(status.value)}
                  onCheckedChange={(checked) => toggleStatus(status.value, checked)}
                />
                <Label htmlFor={id} className="flex-1 font-normal">
                  {status.label}
                </Label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {status.count}
                </span>
              </div>
            );
          })}
        </fieldset>
        <Separator />
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span id="popover-06-score" className="text-xs font-medium text-muted-foreground">
              Minimum priority score
            </span>
            <span className="text-sm font-medium tabular-nums">{draft.minScore}</span>
          </div>
          <Slider
            aria-labelledby="popover-06-score"
            min={0}
            max={100}
            step={5}
            value={[draft.minScore]}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                minScore: Array.isArray(value) ? value[0] : value,
              }))
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-2 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDraft({ statuses: [], minScore: 0 })}
          >
            Clear all
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setApplied(draft);
              setOpen(false);
            }}
          >
            Show results
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
