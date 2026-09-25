"use client";

import * as React from "react";
import { Lock } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Label } from "@/registry/base/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";
import { Switch } from "@/registry/base/ui/switch";

const triggerClass =
  "focus-visible:ring-2 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50";

export default function Menubar06() {
  const [readOnly, setReadOnly] = React.useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Menubar aria-label="Contract">
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>File</MenubarTrigger>
            <MenubarContent className="min-w-44">
              <MenubarItem>
                Download PDF
                <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Copy link</MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled={readOnly}>Rename</MenubarItem>
              <MenubarItem disabled={readOnly} variant="destructive">
                Delete contract
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu disabled={readOnly}>
            <MenubarTrigger className={triggerClass}>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Undo
                <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Suggest changes</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu disabled={readOnly}>
            <MenubarTrigger className={triggerClass}>Insert</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Signature field</MenubarItem>
              <MenubarItem>Date field</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        {readOnly ? (
          <Badge variant="secondary">
            <Lock aria-hidden="true" />
            View only
          </Badge>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {readOnly
          ? "Signed contracts are locked. You can still download or share them."
          : "Editing is on. Changes are tracked for the other signers."}
      </p>
      <div className="flex items-center gap-2 border-t pt-3">
        <Switch
          id="menubar-06-read-only"
          size="sm"
          checked={readOnly}
          onCheckedChange={setReadOnly}
        />
        <Label htmlFor="menubar-06-read-only" className="text-sm font-normal">
          Read-only mode
        </Label>
      </div>
    </div>
  );
}
