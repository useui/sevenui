"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/registry/base/ui/combobox";

const statuses = [
  { value: "backlog", label: "Backlog", dotClassName: "border border-dashed border-muted-foreground" },
  { value: "todo", label: "Todo", dotClassName: "border-2 border-muted-foreground" },
  { value: "in-progress", label: "In progress", dotClassName: "bg-warning" },
  { value: "in-review", label: "In review", dotClassName: "bg-chart-2" },
  { value: "done", label: "Done", dotClassName: "bg-success" },
  { value: "canceled", label: "Canceled", dotClassName: "bg-muted-foreground/40" },
];

type Status = (typeof statuses)[number];

function StatusDot({ status }: { status: Status }) {
  return (
    <span
      aria-hidden="true"
      className={`size-2.5 shrink-0 rounded-full ${status.dotClassName}`}
    />
  );
}

export default function Combobox07() {
  const [status, setStatus] = React.useState<Status>(statuses[2]);

  return (
    <div className="flex w-full max-w-xs items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-card-foreground">
      <span id="combobox-07-label" className="text-sm text-muted-foreground">
        Status
      </span>
      <Combobox
        items={statuses}
        value={status}
        onValueChange={(next) => {
          if (next) setStatus(next);
        }}
      >
        <ComboboxTrigger
          aria-labelledby="combobox-07-label combobox-07-value"
          render={<Button variant="ghost" size="sm" className="-mr-1.5 gap-2 font-normal" />}
        >
          <StatusDot status={status} />
          <span id="combobox-07-value">{status.label}</span>
        </ComboboxTrigger>
        <ComboboxContent align="end" className="w-56 min-w-56">
          <ComboboxInput
            placeholder="Change status…"
            aria-label="Filter statuses"
            showTrigger={false}
          />
          <ComboboxEmpty>No status with that name.</ComboboxEmpty>
          <ComboboxList>
            {(item: Status) => (
              <ComboboxItem key={item.value} value={item}>
                <StatusDot status={item} />
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
