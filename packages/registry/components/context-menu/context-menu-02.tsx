"use client";

import * as React from "react";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
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

type ViewOption = "grid" | "rulers" | "guides" | "snap";

const options: { key: ViewOption; label: string; shortcut: string }[] = [
  { key: "grid", label: "Pixel grid", shortcut: "⌘'" },
  { key: "rulers", label: "Rulers", shortcut: "⇧R" },
  { key: "guides", label: "Layout guides", shortcut: "⌘G" },
  { key: "snap", label: "Snap to grid", shortcut: "⇧S" },
];

export default function ContextMenu02() {
  const [view, setView] = React.useState<Record<ViewOption, boolean>>({
    grid: true,
    rulers: true,
    guides: false,
    snap: true,
  });

  const active = options.filter((option) => view[option.key]);

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <ContextMenu>
        <ContextMenuTrigger
          onKeyDown={openMenuWithShiftF10}
          tabIndex={0}
          aria-label="Artboard. Right-click or press Shift+F10 for view options."
          className="relative flex aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {view.rulers && (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-4 border-b border-border bg-[repeating-linear-gradient(90deg,var(--color-border)_0_1px,transparent_1px_12px)] bg-muted"
              />
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-4 border-r border-border bg-[repeating-linear-gradient(0deg,var(--color-border)_0_1px,transparent_1px_12px)] bg-muted"
              />
            </>
          )}
          <div
            className={
              view.rulers
                ? "absolute inset-0 top-4 left-4"
                : "absolute inset-0"
            }
          >
            {view.grid && (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[14px_14px]"
              />
            )}
            {view.guides && (
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-1/2 w-px bg-chart-1/60"
              />
            )}
            <div className="absolute top-1/2 left-1/2 flex h-16 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background text-xs font-medium shadow-sm">
              Sign-up card
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuGroup>
            <ContextMenuLabel>View</ContextMenuLabel>
            {options.map((option) => (
              <ContextMenuCheckboxItem
                key={option.key}
                checked={view[option.key]}
                closeOnClick={false}
                onCheckedChange={(checked) =>
                  setView((prev) => ({ ...prev, [option.key]: checked }))
                }
              >
                {option.label}
                <ContextMenuShortcut className="mr-4">
                  {option.shortcut}
                </ContextMenuShortcut>
              </ContextMenuCheckboxItem>
            ))}
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <p className="px-1.5 py-1 text-xs text-muted-foreground">
            Changes apply instantly; the menu stays open.
          </p>
        </ContextMenuContent>
      </ContextMenu>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {active.length > 0
          ? `Showing ${active.map((option) => option.label.toLowerCase()).join(", ")}`
          : "All view aids hidden"}
      </p>
    </div>
  );
}
