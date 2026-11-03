import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-[var(--control-gap,0.5rem)] rounded-lg border border-transparent bg-clip-padding text-[length:var(--control-text,0.8125rem)] font-medium whitespace-nowrap outline-none select-none transition-[transform,translate,scale,box-shadow,background-color] duration-100 ease-snappy focus-visible:focus-ring active:not-aria-[haspopup]:translate-y-px active:not-aria-[haspopup]:scale-[0.985] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:active:not-aria-[haspopup]:translate-none motion-reduce:active:not-aria-[haspopup]:scale-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:[--focus-color:var(--destructive)] dark:aria-invalid:border-destructive/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-highlight hover:bg-primary/90",
        accent:
          "bg-brand-strong text-brand-foreground shadow-[inset_0_1px_0_color-mix(in_oklch,var(--brand-foreground,white)_25%,transparent)] hover:bg-brand-strong/90",
        outline:
          "border-hairline-strong bg-surface-raised text-foreground shadow-highlight hover:bg-[color-mix(in_oklch,var(--surface-raised,var(--background)),var(--foreground)_4%)] aria-expanded:bg-[color-mix(in_oklch,var(--surface-raised,var(--background)),var(--foreground)_4%)]",
        secondary:
          "bg-surface-panel text-secondary-foreground shadow-[inset_0_0_0_1px_var(--hairline,transparent)] hover:bg-[color-mix(in_oklch,var(--surface-panel,var(--secondary)),var(--foreground)_5%)] aria-expanded:bg-[color-mix(in_oklch,var(--surface-panel,var(--secondary)),var(--foreground)_5%)]",
        ghost:
          "hover:bg-[color-mix(in_oklch,var(--surface-panel,var(--muted)),var(--foreground)_5%)] hover:text-foreground aria-expanded:bg-[color-mix(in_oklch,var(--surface-panel,var(--muted)),var(--foreground)_5%)] aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-brand decoration-brand/40 underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[var(--control-h,2.125rem)] px-[var(--control-px,0.75rem)] has-data-[icon=inline-end]:pr-[calc(var(--control-px,0.75rem)-0.25rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px,0.75rem)-0.25rem)]",
        xs: "h-[calc(var(--control-h,2.125rem)-0.5rem)] gap-1 rounded-[min(--theme(--radius-md),10px)] px-[calc(var(--control-px,0.75rem)-0.25rem)] text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-[calc(var(--control-px,0.75rem)-0.375rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px,0.75rem)-0.375rem)] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[calc(var(--control-h,2.125rem)-0.25rem)] gap-1 rounded-[min(--theme(--radius-md),12px)] px-[calc(var(--control-px,0.75rem)-0.125rem)] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-[calc(var(--control-px,0.75rem)-0.375rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px,0.75rem)-0.375rem)] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-[calc(var(--control-h,2.125rem)+0.25rem)] px-[calc(var(--control-px,0.75rem)+0.125rem)] has-data-[icon=inline-end]:pr-[calc(var(--control-px,0.75rem)-0.125rem)] has-data-[icon=inline-start]:pl-[calc(var(--control-px,0.75rem)-0.125rem)]",
        icon: "size-[var(--control-h,2.125rem)]",
        "icon-xs":
          "size-[calc(var(--control-h,2.125rem)-0.5rem)] rounded-[min(--theme(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-[calc(var(--control-h,2.125rem)-0.25rem)] rounded-[min(--theme(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-[calc(var(--control-h,2.125rem)+0.25rem)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
