"use client";

import * as React from "react";
import { Copy, Link2, MoreHorizontal, PencilLine, Star, Trash2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

const ACTIONS = [
  { key: "rename", label: "Rename", icon: PencilLine, result: "Editing the name of “Q3 roadmap”." },
  { key: "duplicate", label: "Duplicate", icon: Copy, result: "Created “Q3 roadmap (copy)”." },
  { key: "link", label: "Copy link", icon: Link2, result: "Link copied to clipboard." },
  { key: "star", label: "Add to favorites", icon: Star, result: "Added to your sidebar favorites." },
] as const;

export default function DropdownMenu09() {
  // Controlled: the menu opens from the trigger or from a global ⌘J / Ctrl+J shortcut.
  const [open, setOpen] = React.useState(false);
  const [lastAction, setLastAction] = React.useState("No actions yet.");
  const [isMac, setIsMac] = React.useState(true);

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));

    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "j" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card text-card-foreground shadow-xs">
      <div className="flex items-center gap-3 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
          FIG
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Q3 roadmap</p>
          <p className="truncate text-xs text-muted-foreground">
            Edited 12 minutes ago by Omar
          </p>
        </div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="File actions"
                aria-keyshortcuts="Meta+J Control+J"
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              {ACTIONS.map(({ key, label, icon: Icon, result }) => (
                <DropdownMenuItem key={key} onClick={() => setLastAction(result)}>
                  <Icon aria-hidden="true" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setLastAction("Moved to trash. Undo within 30 days.")}
            >
              <Trash2 aria-hidden="true" />
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <p aria-live="polite" className="min-w-0 truncate">
          {lastAction}
        </p>
        <span className="flex shrink-0 items-center gap-1.5">
          Press
          <KbdGroup>
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>J</Kbd>
          </KbdGroup>
        </span>
      </div>
    </div>
  );
}
