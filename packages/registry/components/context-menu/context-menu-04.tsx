"use client";

import {
  Download,
  Eye,
  Link,
  Lock,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import * as React from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

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

const editActions = [
  { label: "Edit document", icon: Pencil, shortcut: "E" },
  { label: "Invite collaborators", icon: UserPlus, shortcut: "⌘I" },
];

export default function ContextMenu04() {
  const [readOnly, setReadOnly] = React.useState(true);
  const switchId = React.useId();

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={switchId}>View-only access</Label>
        <Switch
          id={switchId}
          checked={readOnly}
          onCheckedChange={setReadOnly}
        />
      </div>
      <ContextMenu>
        <ContextMenuTrigger
          onKeyDown={openMenuWithShiftF10}
          tabIndex={0}
          aria-label="2025 hiring plan document. Right-click or press Shift+F10 for actions."
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {readOnly ? (
              <Lock aria-hidden="true" className="size-4" />
            ) : (
              <Pencil aria-hidden="true" className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">2025 hiring plan</p>
            <p className="truncate text-xs text-muted-foreground">
              Shared by Priya Nair · {readOnly ? "Can view" : "Can edit"}
            </p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-60">
          {readOnly && (
            <>
              <p className="flex items-start gap-1.5 px-1.5 py-1 text-xs text-muted-foreground">
                <Eye
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                You have view-only access. Ask Priya to change it.
              </p>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuGroup>
            <ContextMenuItem>
              <Link aria-hidden="true" />
              Copy link
              <ContextMenuShortcut>⌘L</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              <Download aria-hidden="true" />
              Download as PDF
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            {editActions.map(({ label, icon: Icon, shortcut }) => (
              <ContextMenuItem key={label} disabled={readOnly}>
                <Icon aria-hidden="true" />
                {label}
                {readOnly ? (
                  <Lock
                    aria-hidden="true"
                    className="ml-auto size-3.5 text-muted-foreground"
                  />
                ) : (
                  <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>
                )}
              </ContextMenuItem>
            ))}
            <ContextMenuItem variant="destructive" disabled={readOnly}>
              <Trash2 aria-hidden="true" />
              Move to trash
              {readOnly && (
                <Lock
                  aria-hidden="true"
                  className="ml-auto size-3.5 text-muted-foreground"
                />
              )}
            </ContextMenuItem>
          </ContextMenuGroup>
          {readOnly && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem>
                <UserPlus aria-hidden="true" />
                Request edit access
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
