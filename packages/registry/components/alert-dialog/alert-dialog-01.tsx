"use client";

import { LogOutIcon } from "lucide-react";

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

export default function AlertDialog01() {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline">
            <LogOutIcon aria-hidden="true" data-icon="inline-start" />
            Sign out everywhere
          </Button>
        }
      />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <LogOutIcon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
          <AlertDialogDescription>
            You will stay signed in here. Your 4 other sessions end right away.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Sign out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
