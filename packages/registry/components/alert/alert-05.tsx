"use client";

import * as React from "react";
import { MegaphoneIcon, RotateCcwIcon, XIcon } from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";

export default function Alert05() {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="grid w-full max-w-md gap-3">
      {open ? (
        <Alert role="status">
          <MegaphoneIcon aria-hidden="true" />
          <AlertTitle>Workflows now run in parallel</AlertTitle>
          <AlertDescription>
            Independent steps start at the same time, cutting average run time
            by 40%. <a href="#changelog">Read the changelog</a>
          </AlertDescription>
          <AlertAction>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Dismiss announcement"
              onClick={() => setOpen(false)}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed px-2.5 py-2 text-sm text-muted-foreground">
          <span>Announcement dismissed.</span>
          <Button variant="outline" size="xs" onClick={() => setOpen(true)}>
            <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
            Show again
          </Button>
        </div>
      )}
    </div>
  );
}
