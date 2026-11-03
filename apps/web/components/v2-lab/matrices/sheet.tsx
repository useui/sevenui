"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/registry/base/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { LabSection } from "../lab-frame";

const SIDES = ["top", "right", "bottom", "left"] as const;

/**
 * Keeps an open sheet inside its lab cell: Sheet is Base UI's Dialog, so an
 * outer Dialog.Portal pointed at the box gives SheetContent's own portal a
 * parent node to nest into (cell theme and density apply), and the transform
 * makes the box the containing block for the sheet's fixed position.
 * Non-modal + controlled open, so every cell can show one at once.
 */
function OpenSheet({
  side,
  showCloseButton,
}: {
  side: (typeof SIDES)[number];
  showCloseButton?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-[300px] w-full overflow-hidden rounded-md border border-dashed [transform:translateZ(0)] sm:w-[calc(50%-0.375rem)]"
    >
      <Sheet open modal={false}>
        <DialogPrimitive.Portal container={ref}>
          <SheetContent
            side={side}
            showCloseButton={showCloseButton}
            initialFocus={false}
          >
            <SheetHeader className="pr-12">
              <SheetTitle>Edit settings</SheetTitle>
              <SheetDescription>side={side}</SheetDescription>
            </SheetHeader>
            <SheetFooter className="sm:flex-row sm:justify-end">
              <SheetClose render={<Button variant="outline">Cancel</Button>} />
              <Button>Save</Button>
            </SheetFooter>
          </SheetContent>
        </DialogPrimitive.Portal>
      </Sheet>
    </div>
  );
}

export default function SheetMatrix() {
  return (
    <div>
      <LabSection title="open — every side">
        {SIDES.map((side) => (
          <OpenSheet key={side} side={side} />
        ))}
      </LabSection>
      <LabSection title="open — showCloseButton=false">
        <OpenSheet side="right" showCloseButton={false} />
      </LabSection>
      <LabSection title="trigger (real modal sheet; portals to the page, not the cell)">
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Modal sheet</SheetTitle>
              <SheetDescription>Backdrop and focus trap are live.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </LabSection>
    </div>
  );
}
