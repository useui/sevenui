"use client";

import * as React from "react";
import { Meter as MeterPrimitive } from "@base-ui/react/meter";

import { cn } from "@/registry/base/lib/utils";

function Meter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MeterPrimitive.Root>) {
  return (
    <MeterPrimitive.Root
      className={cn("grid w-full gap-2", className)}
      {...props}
    >
      {children}
      <MeterPrimitive.Track className="col-span-full h-2 w-full overflow-hidden rounded-full bg-primary/20">
        <MeterPrimitive.Indicator className="h-full bg-primary transition-[width] duration-500" />
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  );
}

function MeterLabel({
  className,
  ...props
}: React.ComponentProps<typeof MeterPrimitive.Label>) {
  return (
    <MeterPrimitive.Label
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function MeterValue({
  className,
  ...props
}: React.ComponentProps<typeof MeterPrimitive.Value>) {
  return (
    <MeterPrimitive.Value
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Meter, MeterLabel, MeterValue };
