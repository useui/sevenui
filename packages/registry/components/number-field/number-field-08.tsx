"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, HardDriveIcon, Loader2Icon } from "lucide-react";
import { cn } from "cn";

import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

type Status = "idle" | "saving" | "saved";

const savedQuota = 250;

export default function NumberField08() {
  const [status, setStatus] = useState<Status>("idle");
  const [committed, setCommitted] = useState(savedQuota);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  function handleCommit(value: number | null) {
    if (value === null || value === committed) return;
    for (const timer of timers.current) clearTimeout(timer);
    timers.current.length = 0;
    setStatus("saving");
    timers.current.push(
      setTimeout(() => {
        setCommitted(value);
        setStatus("saved");
      }, 900),
      setTimeout(() => setStatus("idle"), 3200),
    );
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor="number-field-08">Storage quota per workspace</Label>
      <NumberField
        id="number-field-08"
        defaultValue={savedQuota}
        min={10}
        max={2000}
        step={10}
        largeStep={100}
        onValueCommitted={handleCommit}
      >
        <NumberFieldGroup
          data-status={status}
          className="w-full transition-[border-color,box-shadow] duration-300 data-[status=saved]:border-success/60 data-[status=saved]:ring-3 data-[status=saved]:ring-success/15"
        >
          <span
            aria-hidden="true"
            className="flex items-center border-r border-input bg-muted/50 px-3 text-muted-foreground"
          >
            <HardDriveIcon className="size-4" />
          </span>
          <NumberFieldInput className="min-w-0 flex-1 pl-3 text-left" />
          <span className="relative flex w-16 items-center justify-end gap-1.5 pr-3 text-xs text-muted-foreground">
            <Loader2Icon
              aria-hidden="true"
              className={cn(
                "absolute left-1 size-3.5 animate-spin transition-[opacity,scale] duration-200",
                status === "saving" ? "scale-100 opacity-100" : "scale-50 opacity-0",
              )}
            />
            <CheckIcon
              aria-hidden="true"
              className={cn(
                "absolute left-1 size-3.5 text-success transition-[opacity,scale] duration-300 ease-out",
                status === "saved" ? "scale-100 opacity-100" : "scale-50 opacity-0",
              )}
            />
            GB
          </span>
          <NumberFieldDecrement />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
      <p
        aria-live="polite"
        className={cn(
          "text-xs transition-colors duration-300",
          status === "saved" ? "text-success" : "text-muted-foreground",
        )}
      >
        {status === "saving"
          ? "Saving…"
          : status === "saved"
            ? `Saved. Workspaces now get ${committed} GB each.`
            : `Saves when you leave the field. Current: ${committed} GB.`}
      </p>
    </div>
  );
}
