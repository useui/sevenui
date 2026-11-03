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
        // The edge is a border and the inset is the only shadow, so consumer
        // border-* and shadow-* classes merge against them. The leading
        // 0_0_#0000 lets cn read the arbitrary value as a shadow.
        "h-[var(--control-h,2.125rem)] w-full min-w-0 rounded-lg bg-surface-inset px-[var(--control-px,0.75rem)] py-1 text-base text-foreground border border-hairline-strong shadow-[0_0_#0000,var(--elevation-inset,0_0_#0000)] transition-[border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none md:text-[length:var(--control-text,0.8125rem)]",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-[length:var(--control-text,0.8125rem)] file:font-medium file:text-foreground placeholder:text-muted-foreground",
        "focus-visible:focus-ring",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:[--focus-color:var(--destructive)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
