"use client";

import { FileTextIcon } from "lucide-react";

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

export default function AlertDialog03() {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline">Close document</Button>}
      />
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <FileTextIcon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Save changes to "Q3 roadmap"?</AlertDialogTitle>
          <AlertDialogDescription>
            You have 3 unsaved edits since 10:42 AM. If you don't save, they
            will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            variant="ghost"
            className="text-destructive hover:text-destructive sm:mr-auto"
          >
            Don't save
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
