"use client";

import * as React from "react";
import { Meter as MeterPrimitive } from "@base-ui/react/meter";

import { cn } from "cn";

function Meter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MeterPrimitive.Root>) {
  return (
    <MeterPrimitive.Root
      data-slot="meter"
      className={cn("grid w-full gap-2", className)}
      {...props}
    >
      {children}
      <MeterPrimitive.Track
        data-slot="meter-track"
        className="col-span-full h-1 w-full overflow-hidden rounded-full bg-hairline-strong in-data-[density=compact]:h-[3px]"
      >
        <MeterPrimitive.Indicator
          data-slot="meter-indicator"
          className="h-full bg-foreground transition-[width] duration-300 ease-snappy motion-reduce:transition-none"
        />
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
      data-slot="meter-label"
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
      data-slot="meter-value"
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
      {...props}
    />
  );
}

export { Meter, MeterLabel, MeterValue };
