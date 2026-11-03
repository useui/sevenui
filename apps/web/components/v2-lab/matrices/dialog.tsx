"use client";

import * as React from "react";
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Input } from "@/registry/base/ui/input";
import { LabSection } from "../lab-frame";

/**
 * A box that keeps an open dialog inside its lab cell. The outer portal is
 * given the box as its container; the portal DialogContent renders inside it
 * nests into that node, so the cell's theme and density apply. The transform
 * makes the box the containing block for the dialog's fixed positioning.
 * Dialogs are non-modal and controlled-open so four cells can show them at
 * once without scroll lock or focus traps.
 */
function Stage({
  children,
  height = 360,
}: {
  children: (container: React.RefObject<HTMLDivElement | null>) => React.ReactNode;
  height?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      style={{ height }}
      className="relative w-full overflow-hidden rounded-md border border-dashed [transform:translateZ(0)]"
    >
      {children(ref)}
    </div>
  );
}

function OpenDialog({
  children,
  showCloseButton,
}: {
  children: React.ReactNode;
  showCloseButton?: boolean;
}) {
  return (
    <Stage>
      {(container) => (
        <Dialog open modal={false}>
          <DialogPortal container={container}>
            <DialogContent showCloseButton={showCloseButton} initialFocus={false}>
              {children}
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )}
    </Stage>
  );
}

export default function DialogMatrix() {
  return (
    <div>
      <LabSection title="open — header, body, footer (reference composition)">
        <OpenDialog>
          <DialogHeader>
            <DialogTitle>Delete workspace?</DialogTitle>
            <DialogDescription>
              This removes Acme Inc, its 24 members and every agent run. Type
              the workspace name to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input placeholder="Acme Inc" aria-label="Workspace name" />
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button variant="destructive">Delete workspace</Button>
          </DialogFooter>
        </OpenDialog>
      </LabSection>
      <LabSection title="open — no footer, showCloseButton=false">
        <OpenDialog showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>
              Press ? anywhere to open this list again.
            </DialogDescription>
          </DialogHeader>
        </OpenDialog>
      </LabSection>
      <LabSection title="open — footer showCloseButton, long title">
        <OpenDialog>
          <DialogHeader>
            <DialogTitle>
              A very long dialog title that wraps onto a second line
            </DialogTitle>
            <DialogDescription>Body text sits on the panel.</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button>Save changes</Button>
          </DialogFooter>
        </OpenDialog>
      </LabSection>
      <LabSection title="trigger (opens a real modal dialog; portals to the page, not the cell)">
        <Dialog>
          <DialogTrigger render={<Button variant="outline">Open modal</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modal dialog</DialogTitle>
              <DialogDescription>
                Backdrop, focus trap and scroll lock are live here.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </LabSection>
    </div>
  );
}
