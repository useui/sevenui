"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";
import { LabSection } from "../lab-frame";

const SIDES = ["bottom", "top", "right", "left"] as const;

function Card() {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-medium">@sevenui</p>
      <p className="text-muted-foreground">
        The Base UI component registry. Joined November 2026.
      </p>
    </div>
  );
}

/**
 * Keeps an open hover card inside its lab cell. PreviewCard.Portal is Base
 * UI's "lite" portal: it nests into a parent portal node but never provides
 * one, so the stage hosts its content in an open Popover.Portal (the full
 * portal, which does) pointed at the box. HoverCardContent's own portal then
 * lands in the cell, where its theme and density apply.
 */
function OpenHoverCard({ side }: { side: (typeof SIDES)[number] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative grid h-[260px] w-full place-items-center rounded-md border border-dashed"
    >
      <PopoverPrimitive.Root open>
        <PopoverPrimitive.Portal container={ref}>
          <HoverCard open>
            <HoverCardTrigger
              href="#"
              className="text-sm underline underline-offset-4"
            >
              side={side}
            </HoverCardTrigger>
            <HoverCardContent side={side} className="w-52">
              <Card />
            </HoverCardContent>
          </HoverCard>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

export default function HoverCardMatrix() {
  return (
    <div>
      <LabSection title="open — every side">
        {SIDES.map((side) => (
          <OpenHoverCard key={side} side={side} />
        ))}
      </LabSection>
      <LabSection title="trigger (hover to open; portals to the page, not the cell)">
        <HoverCard>
          <HoverCardTrigger
            href="#"
            className="text-sm underline underline-offset-4"
          >
            Hover me
          </HoverCardTrigger>
          <HoverCardContent>
            <Card />
          </HoverCardContent>
        </HoverCard>
      </LabSection>
    </div>
  );
}
