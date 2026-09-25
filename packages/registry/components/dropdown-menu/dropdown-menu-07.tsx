"use client";

import * as React from "react";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const STATUSES = [
  { value: "backlog", label: "Backlog", tone: "text-muted-foreground!", dashed: true },
  { value: "todo", label: "Todo", tone: "text-muted-foreground!", dashed: false },
  { value: "in-progress", label: "In progress", tone: "text-chart-4!", dashed: false },
  { value: "in-review", label: "In review", tone: "text-chart-2!", dashed: false },
  { value: "done", label: "Done", tone: "text-success!", dashed: false },
  { value: "canceled", label: "Canceled", tone: "text-destructive!", dashed: false },
] as const;

type Status = (typeof STATUSES)[number]["value"];

function StatusDot({
  tone,
  dashed,
  filled = false,
}: {
  tone: string;
  dashed: boolean;
  filled?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-current",
        tone,
        dashed && "border-dashed",
      )}
    >
      {/* The inner fill is the custom indicator: it grows in when the row is checked. */}
      <span
        className={cn(
          "size-1.5 scale-0 rounded-full bg-current text-inherit! transition-transform duration-150 ease-out group-data-checked/status:scale-100 motion-reduce:transition-none",
          filled && "scale-100",
        )}
      />
    </span>
  );
}

export default function DropdownMenu07() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<Status>("in-progress");
  const current = STATUSES.find((item) => item.value === status) ?? STATUSES[0];

  return (
    <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-card-foreground">
      <span className="min-w-0 truncate text-sm">
        <span className="text-muted-foreground">SEV-412 </span>
        Webhook retries drop payloads
      </span>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Status: ${current.label}. Change status`}
              className="shrink-0"
            >
              <StatusDot tone={current.tone} dashed={current.dashed} filled />
              {current.label}
            </Button>
          }
        />
        <DropdownMenuContent
          align="end"
          className="w-48"
          onKeyDown={(event) => {
            // Number keys jump straight to a status, matching the shortcut hints.
            const match = STATUSES[Number(event.key) - 1];
            if (match) {
              setStatus(match.value);
              setOpen(false);
            }
          }}
        >
          <DropdownMenuRadioGroup
            value={status}
            onValueChange={(value) => setStatus(value as Status)}
          >
            <DropdownMenuLabel>Set status</DropdownMenuLabel>
            {STATUSES.map((item, index) => (
              <DropdownMenuRadioItem
                key={item.value}
                value={item.value}
                closeOnClick
                className="group/status pr-2 *:data-[slot=dropdown-menu-radio-item-indicator]:hidden"
              >
                <StatusDot tone={item.tone} dashed={item.dashed} />
                {item.label}
                <DropdownMenuShortcut>{index + 1}</DropdownMenuShortcut>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
