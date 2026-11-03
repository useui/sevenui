import * as React from "react";
import { cn } from "cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[calc(var(--control-h,2.125rem)*2.5)] w-full rounded-lg bg-surface-inset px-[var(--control-px,0.75rem)] py-[calc(var(--control-px,0.75rem)*0.66)] text-base text-foreground border border-hairline-strong shadow-[0_0_#0000,var(--elevation-inset,0_0_#0000)] transition-[border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none md:text-[length:var(--control-text,0.8125rem)]",
        "placeholder:text-muted-foreground",
        "focus-visible:focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:[--focus-color:var(--destructive)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
