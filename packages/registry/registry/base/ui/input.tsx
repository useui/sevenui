import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

/**
 * Density tokens are read with an inline fallback (`var(--control-h,…)`)
 * instead of a `[:where(&)]` default: a default declared on the element would
 * beat the value inherited from a `[data-density=compact]` ancestor.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[var(--control-h,2.125rem)] w-full min-w-0 rounded-lg bg-surface-inset px-[var(--control-px,0.75rem)] py-1 text-base text-foreground shadow-[inset_0_0_0_1px_var(--hairline-strong,var(--input)),var(--elevation-inset,0_0_transparent)] transition-shadow duration-150 outline-none motion-reduce:transition-none md:text-[length:var(--control-text,0.8125rem)]",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-[length:var(--control-text,0.8125rem)] file:font-medium file:text-foreground placeholder:text-muted-foreground",
        "focus-visible:focus-ring",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--destructive)_60%,transparent),var(--elevation-inset,0_0_transparent)] aria-invalid:[--focus-color:var(--destructive)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
