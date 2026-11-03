"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "cn";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  side,
  align,
  sideOffset = 8,
  alignOffset,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof TooltipPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          className={cn(
            // Inverted bubble, fixed size; a 100ms fade, instant under reduced motion.
            "w-fit max-w-xs origin-[var(--transform-origin)] rounded-md bg-foreground px-2 py-1 text-xs text-balance text-background transition-opacity duration-100 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:opacity-0 motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 rotate-45 rounded-[2px] bg-foreground data-[side=bottom]:-top-[5px] data-[side=left]:-right-[5px] data-[side=right]:-left-[5px] data-[side=top]:-bottom-[5px]" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
