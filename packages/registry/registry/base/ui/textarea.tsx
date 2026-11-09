import * as React from "react";
import { cn } from "cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[calc(var(--control-h,2.125rem)*2.5)] w-full rounded-lg border border-input bg-transparent px-[var(--control-px,0.75rem)] py-[calc(var(--control-px,0.75rem)*0.66)] text-base transition-[color,border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none md:text-[length:var(--control-text,0.8125rem)] dark:bg-input/30",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:disabled:bg-input/80",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
