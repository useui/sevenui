"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "cn";
import { CheckIcon, MinusIcon } from "lucide-react";

// The box size follows the density scale (16px comfortable, 14px compact).
// `--control-h` falls back inline rather than through a `:where()` default:
// a default declared on the element itself would shadow the value inherited
// from a `[data-density=compact]` ancestor.
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-[max(0.875rem,calc(var(--control-h,2.125rem)*0.47))] shrink-0 items-center justify-center rounded-[5px] bg-surface-inset shadow-[inset_0_0_0_1px_var(--hairline-strong,var(--input))] transition-[background-color,box-shadow] duration-150 outline-none motion-reduce:transition-none [:where(&)]:[--focus-gap:2px] [:where(&)]:[--focus-width:1.5px] after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:focus-ring group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] aria-invalid:[--focus-color:var(--destructive)] data-checked:bg-brand data-checked:text-brand-foreground data-checked:shadow-none data-indeterminate:bg-brand data-indeterminate:text-brand-foreground data-indeterminate:shadow-none",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex size-full items-center justify-center text-current transition-opacity duration-100 motion-reduce:transition-none data-starting-style:opacity-0 data-ending-style:opacity-0 [&>svg]:size-3/4 [&>svg]:stroke-[2.5] data-indeterminate:[&>svg:first-child]:hidden not-data-indeterminate:[&>svg:last-child]:hidden"
      >
        <CheckIcon />
        <MinusIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
