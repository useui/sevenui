"use client";

import * as React from "react";
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { MinusIcon, PlusIcon } from "lucide-react";

import { cn } from "cn";

function NumberField({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Root>) {
  return (
    <NumberFieldPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

function NumberFieldScrubArea({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.ScrubArea>) {
  return (
    <NumberFieldPrimitive.ScrubArea
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    />
  );
}

function NumberFieldGroup({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Group>) {
  return (
    <NumberFieldPrimitive.Group
      className={cn(
        "flex h-[var(--control-h,2.125rem)] w-fit items-stretch overflow-hidden rounded-md border border-input shadow-xs transition-shadow duration-150 motion-reduce:transition-none focus-within:ring-2 focus-within:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

const stepperClasses =
  "flex w-[var(--control-h,2.125rem)] shrink-0 items-center justify-center bg-muted/50 text-muted-foreground transition-[color,background-color] duration-150 select-none motion-reduce:transition-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

function NumberFieldDecrement({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Decrement>) {
  return (
    <NumberFieldPrimitive.Decrement
      className={cn(stepperClasses, "border-r border-input", className)}
      {...props}
    >
      <MinusIcon />
    </NumberFieldPrimitive.Decrement>
  );
}

function NumberFieldInput({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Input>) {
  return (
    <NumberFieldPrimitive.Input
      className={cn(
        "h-full w-16 min-w-0 bg-transparent text-center text-[length:var(--control-text,0.8125rem)] text-foreground tabular-nums outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldIncrement({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Increment>) {
  return (
    <NumberFieldPrimitive.Increment
      className={cn(stepperClasses, "border-l border-input", className)}
      {...props}
    >
      <PlusIcon />
    </NumberFieldPrimitive.Increment>
  );
}

export {
  NumberField,
  NumberFieldScrubArea,
  NumberFieldGroup,
  NumberFieldDecrement,
  NumberFieldInput,
  NumberFieldIncrement,
};
