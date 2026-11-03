"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { LabSection } from "../lab-frame";

const SIDES = ["bottom", "top", "right", "left"] as const;

/**
 * Keeps an open popover inside its lab cell: an outer Popover.Portal pointed
 * at the box gives PopoverContent's own portal a parent node to nest into, so
 * the cell's theme and density apply. Controlled open without a handler keeps
 * it open in every cell.
 */
function OpenPopover({ side }: { side: (typeof SIDES)[number] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative grid h-[280px] w-full place-items-center rounded-md border border-dashed"
    >
      <Popover open>
        <PopoverTrigger render={<Button variant="outline">side={side}</Button>} />
        <PopoverPrimitive.Portal container={ref}>
          <PopoverContent side={side} className="w-56" initialFocus={false}>
            <PopoverHeader>
              <PopoverTitle>Dimensions</PopoverTitle>
              <PopoverDescription>Set the layer dimensions.</PopoverDescription>
            </PopoverHeader>
            <Input defaultValue="100%" aria-label="Width" />
          </PopoverContent>
        </PopoverPrimitive.Portal>
      </Popover>
    </div>
  );
}

export default function PopoverMatrix() {
  return (
    <div>
      <LabSection title="open — every side">
        {SIDES.map((side) => (
          <OpenPopover key={side} side={side} />
        ))}
      </LabSection>
      <LabSection title="trigger (click to open; portals to the page, not the cell)">
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Open popover</Button>} />
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Dimensions</PopoverTitle>
              <PopoverDescription>Set the layer dimensions.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </LabSection>
    </div>
  );
}
