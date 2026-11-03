"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-[length:var(--control-text,0.8125rem)] font-medium whitespace-nowrap transition-[transform,translate,scale,box-shadow,background-color] duration-100 ease-snappy outline-none hover:bg-[color-mix(in_oklch,var(--surface-panel,var(--muted)),var(--foreground)_5%)] hover:text-foreground focus-visible:focus-ring active:translate-y-px active:scale-[0.985] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:active:translate-none motion-reduce:active:scale-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:[--focus-color:var(--destructive)] aria-pressed:bg-surface-raised aria-pressed:text-foreground aria-pressed:hover:bg-surface-raised [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-transparent aria-pressed:shadow-[var(--elevation-highlight,0_0_#0000),inset_0_0_0_1px_var(--hairline-strong,var(--border))] aria-invalid:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--destructive)_60%,transparent)] aria-invalid:aria-pressed:shadow-[var(--elevation-highlight,0_0_#0000),inset_0_0_0_1px_color-mix(in_oklch,var(--destructive)_60%,transparent)]",
        outline:
          "border border-hairline-strong bg-transparent aria-pressed:bg-[color-mix(in_oklch,var(--surface-raised,var(--background)),var(--foreground)_7%)] aria-pressed:shadow-[var(--elevation-highlight,0_0_#0000)] aria-pressed:hover:bg-[color-mix(in_oklch,var(--surface-raised,var(--background)),var(--foreground)_7%)]",
      },
      size: {
        default:
          "h-[var(--control-h,2.125rem)] min-w-[var(--control-h,2.125rem)] px-[calc(var(--control-px,0.75rem)-0.125rem)] has-data-[icon=inline-end]:pr-[calc(var(--control-px,0.75rem)-0.25rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px,0.75rem)-0.25rem)]",
        sm: "h-[calc(var(--control-h,2.125rem)-0.25rem)] min-w-[calc(var(--control-h,2.125rem)-0.25rem)] rounded-[min(--theme(--radius-md),12px)] px-[calc(var(--control-px,0.75rem)-0.25rem)] has-data-[icon=inline-end]:pr-[calc(var(--control-px,0.75rem)-0.375rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px,0.75rem)-0.375rem)] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[calc(var(--control-h,2.125rem)+0.25rem)] min-w-[calc(var(--control-h,2.125rem)+0.25rem)] px-[var(--control-px,0.75rem)] has-data-[icon=inline-end]:pr-[calc(var(--control-px,0.75rem)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px,0.75rem)-0.125rem)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
