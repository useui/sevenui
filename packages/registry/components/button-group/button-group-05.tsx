"use client";

import { CircleCheck, CircleDot, GitPullRequestArrow } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { ButtonGroup } from "@/registry/base/ui/button-group";

const filters = [
  { value: "open", label: "Open", icon: CircleDot, count: 14 },
  { value: "review", label: "In review", icon: GitPullRequestArrow, count: 5 },
  { value: "closed", label: "Closed", icon: CircleCheck, count: 128 },
];

export default function ButtonGroup05() {
  const [status, setStatus] = React.useState("open");
  const active = filters.find((f) => f.value === status) ?? filters[0];

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ButtonGroup aria-label="Filter issues by status" className="w-full">
        {filters.map((filter) => {
          const selected = filter.value === status;
          return (
            <Button
              key={filter.value}
              variant="outline"
              aria-pressed={selected}
              onClick={() => setStatus(filter.value)}
              className="min-w-0 flex-1 shrink text-muted-foreground aria-pressed:bg-muted aria-pressed:text-foreground dark:aria-pressed:bg-input/60"
            >
              <filter.icon
                aria-hidden="true"
                data-icon="inline-start"
                className="hidden sm:block"
              />
              <span className="truncate">{filter.label}</span>
              <span
                className={
                  selected
                    ? "hidden rounded-md bg-background px-1.5 text-xs tabular-nums text-foreground shadow-xs sm:inline"
                    : "hidden rounded-md px-1.5 text-xs tabular-nums sm:inline"
                }
              >
                {filter.count}
              </span>
            </Button>
          );
        })}
      </ButtonGroup>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {active.count} {active.label.toLowerCase()} issues in{" "}
        <span className="font-medium text-foreground">Billing v2</span>
      </p>
    </div>
  );
}
