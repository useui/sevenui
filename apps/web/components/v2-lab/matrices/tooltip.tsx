"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Button } from "@/registry/base/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";
import { LabSection } from "../lab-frame";

const SIDES = ["top", "bottom", "right", "left"] as const;

/**
 * Keeps an open tooltip inside its lab cell. Tooltip.Portal is Base UI's
 * "lite" portal: it nests into a parent portal node but never provides one,
 * so the stage hosts its content in an open Popover.Portal (the full portal,
 * which does) pointed at the box. TooltipContent's own portal then lands in
 * the cell, where the cell's theme applies. Controlled open keeps it open.
 */
function OpenTooltip({
  side,
  label = "Add to library",
}: {
  side: (typeof SIDES)[number];
  label?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative grid h-[140px] w-full place-items-center rounded-md border border-dashed sm:w-[calc(50%-0.375rem)]"
    >
      <PopoverPrimitive.Root open>
        <PopoverPrimitive.Portal container={ref}>
          <Tooltip open>
            <TooltipTrigger
              render={<Button variant="outline">side={side}</Button>}
            />
            <TooltipContent side={side}>{label}</TooltipContent>
          </Tooltip>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

export default function TooltipMatrix() {
  return (
    <TooltipProvider>
      <LabSection title="open — every side">
        {SIDES.map((side) => (
          <OpenTooltip key={side} side={side} />
        ))}
      </LabSection>
      <LabSection title="open — long label wraps (max-w-xs, text-balance)">
        <OpenTooltip
          side="top"
          label="Saves this component to your library so agents can install it later"
        />
      </LabSection>
      <LabSection title="trigger (hover or focus; portals to the page, not the cell)">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
          <TooltipContent>Add to library</TooltipContent>
        </Tooltip>
      </LabSection>
    </TooltipProvider>
  );
}
