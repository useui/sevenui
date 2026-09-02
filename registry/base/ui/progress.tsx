"use client";

import * as React from "react";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { cn } from "@/registry/base/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root value={value} {...props}>
      <ProgressPrimitive.Track
        className={cn(
          "block h-2 w-full overflow-hidden rounded-full bg-primary/20",
          className,
        )}
      >
        <ProgressPrimitive.Indicator className="bg-primary transition-[width] duration-500" />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
