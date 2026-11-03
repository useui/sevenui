"use client";

import * as React from "react";
import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { LabSection } from "../lab-frame";

const DIRECTIONS = ["down", "up", "left", "right"] as const;

/**
 * Keeps an open drawer inside its lab cell: an outer DrawerPortal pointed at
 * the box gives DrawerContent's own portal a parent node to nest into (cell
 * theme and density apply), and the transform makes the box the containing
 * block for the fixed viewport and popup. Non-modal + controlled open, so
 * every cell can show one at once (non-modal drawers render no overlay).
 */
function OpenDrawer({
  direction,
  showSwipeHandle = true,
}: {
  direction: (typeof DIRECTIONS)[number];
  showSwipeHandle?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-[300px] w-full overflow-hidden rounded-md border border-dashed [transform:translateZ(0)] sm:w-[calc(50%-0.375rem)]"
    >
      <Drawer
        open
        modal={false}
        swipeDirection={direction}
        showSwipeHandle={showSwipeHandle}
      >
        <DrawerPortal container={ref}>
          <DrawerContent initialFocus={false}>
            <DrawerHeader>
              <DrawerTitle>Move goal</DrawerTitle>
              <DrawerDescription>swipeDirection={direction}</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose render={<Button variant="outline">Cancel</Button>} />
            </DrawerFooter>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </div>
  );
}

export default function DrawerMatrix() {
  return (
    <div>
      <LabSection title="open — every swipe direction, with swipe handle">
        {DIRECTIONS.map((direction) => (
          <OpenDrawer key={direction} direction={direction} />
        ))}
      </LabSection>
      <LabSection title="open — no swipe handle">
        <OpenDrawer direction="down" showSwipeHandle={false} />
      </LabSection>
      <LabSection title="trigger (real modal drawer with overlay; portals to the page, not the cell)">
        <Drawer showSwipeHandle>
          <DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Modal drawer</DrawerTitle>
              <DrawerDescription>Overlay and swipe are live.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose render={<Button variant="outline">Close</Button>} />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </LabSection>
    </div>
  );
}
