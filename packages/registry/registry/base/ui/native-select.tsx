import * as React from "react";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
};

function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className,
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        // Control-scale variables fall back inline: a :where() default on
        // this element would shadow a [data-density=compact] ancestor.
        className="h-[var(--control-h,2.125rem)] w-full min-w-0 appearance-none rounded-lg bg-surface-inset py-0 pr-8 pl-[var(--control-px,0.75rem)] text-[length:var(--control-text,0.8125rem)] border border-hairline-strong shadow-[0_0_#0000,var(--elevation-inset,0_0_#0000)] transition-[border-color,box-shadow] outline-none select-none motion-reduce:transition-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:focus-ring disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:[--focus-color:var(--destructive)] data-[size=sm]:h-[calc(var(--control-h,2.125rem)-0.25rem)] data-[size=sm]:rounded-md"
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none group-data-[size=sm]/native-select:right-2 group-data-[size=sm]/native-select:size-3.5"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
