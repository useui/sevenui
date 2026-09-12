"use client";

import { CheckCircle2Icon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";

export default function AlertActionDemo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Backup completed</AlertTitle>
        <AlertDescription>
          Snapshot stored two minutes ago.
        </AlertDescription>
        <AlertAction>
          <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
            <XIcon />
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Conversation deleted</AlertTitle>
        <AlertDescription>This action can be reverted.</AlertDescription>
        <AlertAction>
          <Button variant="outline" size="xs">
            Undo
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}
