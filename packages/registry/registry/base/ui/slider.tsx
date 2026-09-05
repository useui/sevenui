"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/registry/base/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(() => {
    const source = value ?? defaultValue ?? 0;
    return Array.isArray(source) ? source : [source];
  }, [value, defaultValue]);

  return (
    <SliderPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control className="flex w-full items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5">
          <SliderPrimitive.Indicator className="absolute bg-primary" />
        </SliderPrimitive.Track>
        {values.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            index={index}
            className="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[dragging]:ring-2 data-[dragging]:ring-ring/50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
