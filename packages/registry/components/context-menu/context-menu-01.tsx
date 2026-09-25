"use client";

import { ClipboardPaste, Copy, CopyPlus, Scissors, Trash2 } from "lucide-react";
import type * as React from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

const clipboardActions = [
  { label: "Cut", icon: Scissors, shortcut: "⌘X" },
  { label: "Copy", icon: Copy, shortcut: "⌘C" },
  { label: "Paste", icon: ClipboardPaste, shortcut: "⌘V" },
];

export default function ContextMenu01() {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        onKeyDown={openMenuWithShiftF10}
        tabIndex={0}
        aria-label="Hero banner layer. Right-click or press Shift+F10 for actions."
        className="flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="text-sm font-medium">Hero banner</span>
        <span className="text-xs text-muted-foreground">
          Right-click the layer or press Shift+F10
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuGroup>
          {clipboardActions.map(({ label, icon: Icon, shortcut }) => (
            <ContextMenuItem key={label}>
              <Icon aria-hidden="true" />
              {label}
              <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>
            </ContextMenuItem>
          ))}
          <ContextMenuItem>
            <CopyPlus aria-hidden="true" />
            Duplicate
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2 aria-hidden="true" />
          Delete layer
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
