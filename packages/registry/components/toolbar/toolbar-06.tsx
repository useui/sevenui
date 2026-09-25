"use client";

import * as React from "react";
import {
  ClipboardPaste,
  Copy,
  Lock,
  Merge,
  Scissors,
  WrapText,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

const clipboardActions = [
  { label: "Cut", icon: Scissors },
  { label: "Copy", icon: Copy },
];

const cellActions = [
  { label: "Merge cells", icon: Merge },
  { label: "Wrap text", icon: WrapText },
];

export default function Toolbar06() {
  const [locked, setLocked] = React.useState(true);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="toolbar-06-lock">Lock sheet</Label>
          <span className="text-xs text-muted-foreground">
            Viewers can read Q3 Forecast but not change it.
          </span>
        </div>
        <Switch
          id="toolbar-06-lock"
          checked={locked}
          onCheckedChange={setLocked}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Toolbar
          aria-label="Sheet editing"
          disabled={locked}
          className="transition-opacity data-[disabled]:bg-muted/50 data-[disabled]:shadow-none"
        >
          <ToolbarGroup aria-label="Clipboard">
            {clipboardActions.map((action) => (
              <ToolbarButton key={action.label} aria-label={action.label}>
                <action.icon aria-hidden="true" />
              </ToolbarButton>
            ))}
            {/* Disabled on its own: nothing has been copied yet. */}
            <ToolbarButton
              aria-label="Paste (clipboard is empty)"
              disabled
            >
              <ClipboardPaste aria-hidden="true" />
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup aria-label="Cells">
            {cellActions.map((action) => (
              <ToolbarButton key={action.label} aria-label={action.label}>
                <action.icon aria-hidden="true" />
              </ToolbarButton>
            ))}
          </ToolbarGroup>
          {locked ? (
            <>
              <ToolbarSeparator />
              <ToolbarLink
                href="#request-access"
                aria-label="Request access"
                className="whitespace-nowrap text-foreground underline-offset-4 hover:underline"
              >
                Request<span className="max-sm:hidden"> access</span>
              </ToolbarLink>
            </>
          ) : null}
        </Toolbar>
        {locked ? (
          <Badge variant="outline">
            <Lock aria-hidden="true" />
            Read-only
          </Badge>
        ) : (
          <Badge variant="secondary">Editing</Badge>
        )}
      </div>
    </div>
  );
}
