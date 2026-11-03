"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        // Track geometry lives in two variables set here: --switch-h and
        // --switch-w. A [data-density=compact] ancestor and size="sm" each
        // step them down; the thumb is --switch-h minus the 2px inset on each
        // side, and travels --switch-w minus --switch-h.
        "[--switch-h:19px] [--switch-w:2rem] [[data-density=compact]_&]:[--switch-h:1rem] [[data-density=compact]_&]:[--switch-w:1.75rem] data-[size=sm]:[--switch-h:1rem] data-[size=sm]:[--switch-w:1.75rem] [[data-density=compact]_&]:data-[size=sm]:[--switch-h:14px] [[data-density=compact]_&]:data-[size=sm]:[--switch-w:1.5rem]",
        "peer group/switch relative inline-flex h-(--switch-h) w-(--switch-w) shrink-0 items-center rounded-full p-[2px] transition-colors duration-200 outline-none motion-reduce:transition-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:focus-ring group-has-[:focus-visible]/field-label:focus-visible:outline-none aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] aria-invalid:[--focus-color:var(--destructive)] data-checked:bg-brand data-unchecked:bg-hairline-strong data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[calc(var(--switch-h)-4px)] rounded-full bg-white shadow-raised transition-transform duration-200 ease-spring motion-reduce:transition-none data-checked:translate-x-[calc(var(--switch-w)-var(--switch-h))] data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
