"use client";

import {
  Copy,
  Download,
  FolderInput,
  Link2,
  type LucideIcon,
  Trash2,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { Separator } from "@/registry/base/ui/separator";

type Action = {
  label: string;
  hint: string;
  icon: LucideIcon;
};

const actions: Action[] = [
  { label: "Copy link", hint: "Anyone in Acme can view", icon: Link2 },
  { label: "Duplicate", hint: "Creates “Q3 roadmap (copy)”", icon: Copy },
  { label: "Move to folder", hint: "Currently in Planning", icon: FolderInput },
  { label: "Download as PDF", hint: "2.4 MB, 12 pages", icon: Download },
];

export default function Drawer01() {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        render={<Button variant="outline">Document actions</Button>}
      />
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-sm flex-col">
          <DrawerHeader className="pb-2">
            <DrawerTitle>Q3 roadmap</DrawerTitle>
            <DrawerDescription>Edited by Maya Chen 2 hours ago</DrawerDescription>
          </DrawerHeader>
          <ul className="flex flex-col p-2">
            {actions.map((action) => (
              <li key={action.label}>
                <DrawerClose
                  render={
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  }
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                    <action.icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{action.label}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {action.hint}
                    </span>
                  </span>
                </DrawerClose>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="p-2 pb-4">
            <DrawerClose
              render={
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-destructive/30"
                />
              }
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10">
                <Trash2 aria-hidden="true" className="size-4" />
              </span>
              Move to trash
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
