"use client";

import * as React from "react";
import { cn } from "cn";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const limit = 60;

export default function Input07() {
  const [value, setValue] = React.useState("Heads down on the Q3 launch until Friday");
  const remaining = limit - value.length;
  const ratio = value.length / limit;

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-07-status">Status message</Label>
      <div className="relative">
        <Input
          id="input-07-status"
          value={value}
          maxLength={limit}
          aria-describedby="input-07-count"
          onChange={(event) => setValue(event.target.value)}
          className="pr-12"
        />
        <span
          id="input-07-count"
          className={cn(
            "pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs tabular-nums text-muted-foreground transition-colors",
            remaining <= 10 && "text-warning",
            remaining === 0 && "text-destructive",
          )}
        >
          <span className="sr-only">Characters remaining: </span>
          {remaining}
        </span>
      </div>
      <div aria-hidden="true" className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full origin-left rounded-full bg-primary transition-[transform,background-color] duration-200 ease-out motion-reduce:transition-none",
            remaining <= 10 && "bg-warning",
            remaining === 0 && "bg-destructive",
          )}
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Shown next to your name in comments and mentions.
      </p>
    </div>
  );
}
