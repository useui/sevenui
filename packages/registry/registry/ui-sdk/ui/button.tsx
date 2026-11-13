import * as React from "react";
import {
  type ButtonActionDetails,
  Button as ButtonPrimitive,
} from "@ui-sdk/react/button";
import { renderElement } from "@ui-sdk/react/primitive";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-[var(--control-gap,0.5rem)] rounded-lg border border-transparent bg-clip-padding text-[length:var(--control-text,0.8125rem)] font-medium whitespace-nowrap outline-none select-none transition-[transform,translate,scale,box-shadow,background-color] duration-100 ease-snappy focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px active:not-aria-[haspopup]:scale-[0.985] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:active:not-aria-[haspopup]:translate-none motion-reduce:active:not-aria-[haspopup]:scale-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-[color:color-mix(in_oklch,var(--foreground)_30%,var(--destructive))] hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
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

type ButtonPrimitiveProps = React.ComponentProps<typeof ButtonPrimitive>;

function withSlot(slot: string, render: ButtonPrimitiveProps["render"]): ButtonPrimitiveProps["render"] {
  if (render === undefined) return <button data-slot={slot} />;
  if (React.isValidElement<Record<string, unknown>>(render)) {
    return React.cloneElement(render, { "data-slot": render.props["data-slot"] ?? slot });
  }
  return (partProps, state) =>
    renderElement("button", { ...partProps, "data-slot": slot }, render, state);
}

// Typed as Base UI types them, so callers written against the base flavour
// compile unchanged: a <button> event, and UI SDK's press details optional.
type ButtonProps = Omit<ButtonPrimitiveProps, "className" | "onClick"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    onClick?: (
      event: React.MouseEvent<HTMLButtonElement>,
      details?: ButtonActionDetails,
    ) => unknown;
    // Base UI's hint for a `render` that is not a <button>. UI SDK works that
    // out itself, so it is accepted and dropped.
    nativeButton?: boolean;
    "data-slot"?: string;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton: _nativeButton,
  onClick,
  render,
  "data-slot": slot = "button",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size, className }))}
      // UI SDK keeps a button pending while a returned Promise runs; Base UI
      // ignores it, so the result is dropped.
      onClick={
        onClick &&
        (((event: React.MouseEvent<HTMLButtonElement>, details?: ButtonActionDetails) =>
          void onClick(event, details)) as unknown as ButtonPrimitiveProps["onClick"])
      }
      // UI SDK ignores a data-slot prop on a part; one on the rendered
      // element wins, so a caller's slot (carousel-next) goes there. It goes
      // on an element, not a render function, so a Server Component can
      // still render the button (a function cannot cross into the client).
      render={slot === "button" ? render : withSlot(slot, render)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
