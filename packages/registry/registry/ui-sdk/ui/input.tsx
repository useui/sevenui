"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@ui-sdk/react/input";
import { cn } from "cn";

type InputPrimitiveProps = React.ComponentProps<typeof InputPrimitive>;

// UI SDK's text value is a string. The wrapper keeps the native input's
// props (a number `value`, `onSelect`, …) and maps the value to text.
function toText(value: React.ComponentProps<"input">["value"]) {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value.join(",") : String(value);
}

/**
 * Density tokens are read with an inline fallback (`var(--control-h,…)`)
 * instead of a `[:where(&)]` default: a default declared on the element would
 * beat the value inherited from a `[data-density=compact]` ancestor.
 */
function Input({
  className,
  type,
  value,
  defaultValue,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[var(--control-h,2.125rem)] w-full min-w-0 rounded-lg border border-input bg-transparent px-[var(--control-px,0.75rem)] py-1 text-base transition-[color,border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none md:text-[length:var(--control-text,0.8125rem)] dark:bg-input/30",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-[length:var(--control-text,0.8125rem)] file:font-medium file:text-foreground placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:disabled:bg-input/80",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      value={toText(value)}
      defaultValue={toText(defaultValue)}
      {...(props as InputPrimitiveProps)}
    />
  );
}

export { Input };
