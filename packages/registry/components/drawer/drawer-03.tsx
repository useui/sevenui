"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/registry/base/ui/drawer";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const reasonLabels: Record<string, string> = {
  "close-press": "Cancel button",
  "escape-key": "Escape key",
  "outside-press": "Click outside",
  swipe: "Swipe gesture",
  "focus-out": "Focus left",
  "trigger-press": "Trigger",
  "imperative-action": "Save button",
};

export default function Drawer03() {
  const [open, setOpen] = React.useState(false);
  const [pointerDismiss, setPointerDismiss] = React.useState(true);
  const [name, setName] = React.useState("Atlas mobile app");
  const [draft, setDraft] = React.useState(name);
  const [lastReason, setLastReason] = React.useState<string | null>(null);

  const openDrawer = () => {
    setDraft(name);
    setOpen(true);
  };

  const save = () => {
    setName(draft.trim() || name);
    setLastReason("imperative-action");
    setOpen(false);
  };

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-muted-foreground">Project</span>
          <span className="truncate font-medium">{name}</span>
        </div>
        <Badge variant={open ? "default" : "outline"} aria-live="polite">
          {open ? "Open" : "Closed"}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="drawer-03-pointer">Close on outside click</Label>
        <Switch
          id="drawer-03-pointer"
          checked={pointerDismiss}
          onCheckedChange={setPointerDismiss}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Last closed by:{" "}
        <span className="font-medium text-foreground">
          {lastReason ? (reasonLabels[lastReason] ?? lastReason) : "—"}
        </span>
      </p>
      <Button variant="outline" onClick={openDrawer}>
        Rename project
      </Button>

      <Drawer
        open={open}
        disablePointerDismissal={!pointerDismiss}
        onOpenChange={(next, details) => {
          if (!next) setLastReason(details.reason);
          setOpen(next);
        }}
      >
        <DrawerContent>
          <form
            className="mx-auto flex w-full max-w-sm flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <DrawerHeader>
              <DrawerTitle>Rename project</DrawerTitle>
              <DrawerDescription>
                The new name shows up in the sidebar and in shared links.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-2 p-4">
              <Label htmlFor="drawer-03-name">Project name</Label>
              <Input
                id="drawer-03-name"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoComplete="off"
              />
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={!draft.trim()}>
                Save name
              </Button>
              <DrawerClose render={<Button variant="outline">Cancel</Button>} />
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
