"use client";

import type * as React from "react";
import {
  Checkbox as CheckboxPrimitive,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox";
import { cn } from "cn";
import { CheckIcon, MinusIcon } from "lucide-react";

type CheckboxPrimitiveProps = React.ComponentProps<typeof CheckboxPrimitive>;
type CheckedChangeDetails = Parameters<
  NonNullable<CheckboxPrimitiveProps["onCheckedChange"]>
>[1];

// Base UI keeps `indeterminate` apart from `checked`; UI SDK folds it into
// `checked="indeterminate"`. The props keep Base UI's shape and are mapped.
type CheckboxProps = Omit<
  CheckboxPrimitiveProps,
  "checked" | "defaultChecked" | "onCheckedChange" | "className"
> & {
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean, details: CheckedChangeDetails) => void;
  // Base UI's hint for a `render` that is not a <button>; UI SDK needs none.
  nativeButton?: boolean;
};

// The box size follows the density scale (16px comfortable, 14px compact).
// `--control-h` falls back inline rather than through a `:where()` default:
// a default declared on the element itself would shadow the value inherited
// from a `[data-density=compact]` ancestor.
function Checkbox({
  className,
  checked,
  defaultChecked,
  indeterminate,
  onCheckedChange,
  nativeButton: _nativeButton,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-[max(0.875rem,calc(var(--control-h,2.125rem)*0.47))] shrink-0 items-center justify-center rounded-[4px] border border-input transition-[background-color,border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground group-has-[:focus-visible]/field-label:data-checked:border-primary dark:data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-indeterminate:bg-primary",
        className,
      )}
      checked={indeterminate ? "indeterminate" : checked}
      defaultChecked={defaultChecked}
      onCheckedChange={
        onCheckedChange &&
        ((next, details) => onCheckedChange(next === true, details))
      }
      {...props}
    >
      <CheckboxIndicator
        data-slot="checkbox-indicator"
        className="flex size-full items-center justify-center text-current transition-opacity duration-100 motion-reduce:transition-none data-starting-style:opacity-0 data-ending-style:opacity-0 [&>svg]:size-3/4 [&>svg]:stroke-[2.5] data-indeterminate:[&>svg:first-child]:hidden not-data-indeterminate:[&>svg:last-child]:hidden"
      >
        <CheckIcon />
        <MinusIcon />
      </CheckboxIndicator>
    </CheckboxPrimitive>
  );
}

export { Checkbox };
