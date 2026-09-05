"use client";

import * as React from "react";
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";

import { cn } from "@/registry/base/lib/utils";

const HoverCard = PreviewCardPrimitive.Root;

const HoverCardTrigger = PreviewCardPrimitive.Trigger;

function HoverCardContent({
  className,
  side,
  align,
  sideOffset = 4,
  alignOffset,
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof PreviewCardPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset"
  >) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <PreviewCardPrimitive.Popup
          className={cn(
            "w-64 origin-[var(--transform-origin)] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[instant]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
