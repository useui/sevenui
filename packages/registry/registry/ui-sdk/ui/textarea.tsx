"use client";

import * as React from "react";
import { renderElement } from "@ui-sdk/react/primitive";
import { Textarea as TextareaPrimitive } from "@ui-sdk/react/textarea";
import { cn } from "cn";

type TextareaPrimitiveProps = React.ComponentProps<typeof TextareaPrimitive>;

// UI SDK's text value is a string. The wrapper keeps the native textarea's
// props and maps the value to text.
function toText(value: React.ComponentProps<"textarea">["value"]) {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value.join(",") : String(value);
}

function Textarea({
  className,
  value,
  defaultValue,
  // A submit event never reaches a <textarea>, so the native `onSubmit` the
  // base flavour accepts never runs; UI SDK's `onSubmit` is a submit shortcut
  // with another signature, so it is not passed on.
  onSubmit: _onSubmit,
  "data-slot": slot = "textarea",
  ...props
}: React.ComponentProps<"textarea"> & { "data-slot"?: string }) {
  return (
    <TextareaPrimitive
      // UI SDK ignores a data-slot prop on its part; set through `render`, a
      // caller's slot (`input-group-control`) still wins.
      render={(p, state) =>
        renderElement("textarea", { ...p, "data-slot": slot }, undefined, state)
      }
      className={cn(
        "flex field-sizing-content min-h-[calc(var(--control-h,2.125rem)*2.5)] w-full rounded-lg border border-input bg-transparent px-[var(--control-px,0.75rem)] py-[calc(var(--control-px,0.75rem)*0.66)] text-base transition-[color,border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none md:text-[length:var(--control-text,0.8125rem)] dark:bg-input/30",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:disabled:bg-input/80",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      value={toText(value)}
      defaultValue={toText(defaultValue)}
      {...(props as Omit<TextareaPrimitiveProps, "className">)}
    />
  );
}

export { Textarea };
