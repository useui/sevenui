"use client";

import * as React from "react";
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { MinusIcon, PlusIcon } from "lucide-react";

import { cn } from "@/registry/base/lib/utils";

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
        "flex h-9 w-fit items-stretch overflow-hidden rounded-md border border-input shadow-xs transition-shadow focus-within:ring-2 focus-within:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

const stepperClasses =
  "flex w-9 items-center justify-center bg-muted/50 text-muted-foreground transition-colors select-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

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
        "w-16 bg-transparent text-center text-sm tabular-nums outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
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
