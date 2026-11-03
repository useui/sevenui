"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cn } from "cn";

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-[max(0.875rem,calc(var(--control-h,2.125rem)*0.47))] shrink-0 rounded-full bg-surface-inset shadow-[inset_0_0_0_1px_var(--hairline-strong,var(--input))] transition-[background-color,box-shadow] duration-150 outline-none motion-reduce:transition-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:focus-ring group-has-[:focus-visible]/field-label:focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] aria-invalid:[--focus-color:var(--destructive)] data-checked:bg-brand data-checked:text-brand-foreground data-checked:shadow-none",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
