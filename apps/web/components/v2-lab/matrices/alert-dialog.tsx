"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { TrashIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";
import { LabSection } from "../lab-frame";

/**
 * Base UI forces AlertDialog.Root to be modal (scroll lock + inert outside),
 * so four open ones would freeze the lab page. Its parts are Dialog parts,
 * though, so the open cells host AlertDialogContent under a non-modal,
 * controlled-open Dialog.Root: identical markup and classes, role="dialog"
 * instead of "alertdialog". The outer portal targets the box, the content's
 * own portal nests into it, and the transform contains the fixed position.
 */
function OpenAlertDialog({
  size,
  children,
}: {
  size?: "default" | "sm";
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="relative h-[340px] w-full overflow-hidden rounded-md border border-dashed [transform:translateZ(0)]"
    >
      <DialogPrimitive.Root open modal={false}>
        <DialogPrimitive.Portal container={ref}>
          <AlertDialogContent size={size}>{children}</AlertDialogContent>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

function Body({ media = false }: { media?: boolean }) {
  return (
    <>
      <AlertDialogHeader>
        {media && (
          <AlertDialogMedia>
            <TrashIcon />
          </AlertDialogMedia>
        )}
        <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
        <AlertDialogDescription>
          This removes Acme Inc, its 24 members and every agent run.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

export default function AlertDialogMatrix() {
  return (
    <div>
      <LabSection title="open — size=default">
        <OpenAlertDialog>
          <Body />
        </OpenAlertDialog>
      </LabSection>
      <LabSection title="open — size=default with media">
        <OpenAlertDialog>
          <Body media />
        </OpenAlertDialog>
      </LabSection>
      <LabSection title="open — size=sm with media">
        <OpenAlertDialog size="sm">
          <Body media />
        </OpenAlertDialog>
      </LabSection>
      <LabSection title="trigger (real modal alert dialog; portals to the page, not the cell)">
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="outline">Open alert dialog</Button>}
          />
          <AlertDialogContent>
            <Body />
          </AlertDialogContent>
        </AlertDialog>
      </LabSection>
    </div>
  );
}
