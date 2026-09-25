"use client";

import { Grid3x3Icon, MagnetIcon, RulerIcon } from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Kbd } from "@/registry/base/ui/kbd";
import { Toggle } from "@/registry/base/ui/toggle";

type View = "grid" | "rulers" | "snap";

const views: {
  key: View;
  label: string;
  shortcut: string;
  icon: typeof Grid3x3Icon;
}[] = [
  { key: "grid", label: "Pixel grid", shortcut: "G", icon: Grid3x3Icon },
  { key: "rulers", label: "Rulers", shortcut: "R", icon: RulerIcon },
  { key: "snap", label: "Snap to grid", shortcut: "S", icon: MagnetIcon },
];

const ticks = Array.from({ length: 12 }, (_, index) => index);

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export default function Toggle04() {
  const [view, setView] = React.useState<Record<View, boolean>>({
    grid: true,
    rulers: false,
    snap: true,
  });

  function set(key: View, pressed: boolean) {
    setView((current) => ({ ...current, [key]: pressed }));
  }

  // Shift + letter flips the matching toggle, unless the user is typing.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTyping(event.target)) return;
      const match = views.find(
        (item) => item.shortcut.toLowerCase() === event.key.toLowerCase(),
      );
      if (!match) return;
      event.preventDefault();
      setView((current) => ({ ...current, [match.key]: !current[match.key] }));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div
        role="toolbar"
        aria-label="Canvas view"
        className="flex flex-wrap items-center gap-1 border-b p-1.5"
      >
        {views.map((item) => {
          const Icon = item.icon;
          return (
            <Toggle
              key={item.key}
              size="sm"
              pressed={view[item.key]}
              onPressedChange={(pressed) => set(item.key, pressed)}
              aria-keyshortcuts={`Shift+${item.shortcut}`}
              className="gap-1.5"
            >
              <Icon aria-hidden="true" data-icon="inline-start" />
              {item.label}
              <Kbd aria-hidden="true" className="h-4 min-w-4 text-[0.7rem]">
                ⇧{item.shortcut}
              </Kbd>
            </Toggle>
          );
        })}
      </div>
      <div
        className={cn(
          "relative grid aspect-[4/3] bg-muted/40",
          view.rulers
            ? "grid-cols-[1.25rem_1fr] grid-rows-[1.25rem_1fr]"
            : "grid-cols-1 grid-rows-1",
        )}
      >
        {view.rulers && (
          <>
            <div aria-hidden="true" className="border-r border-b bg-card" />
            <div
              aria-hidden="true"
              className="flex items-end justify-between border-b bg-card px-1"
            >
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className={cn(
                    "w-px bg-muted-foreground/60",
                    tick % 4 === 0 ? "h-2.5" : "h-1.5",
                  )}
                />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="flex flex-col items-end justify-between border-r bg-card py-1"
            >
              {ticks.slice(0, 9).map((tick) => (
                <span
                  key={tick}
                  className={cn(
                    "h-px bg-muted-foreground/60",
                    tick % 4 === 0 ? "w-2.5" : "w-1.5",
                  )}
                />
              ))}
            </div>
          </>
        )}
        <div
          role="img"
          aria-label={`Artboard with the pixel grid ${view.grid ? "shown" : "hidden"}, rulers ${view.rulers ? "shown" : "hidden"}, and snapping ${view.snap ? "on" : "off"}`}
          className={cn(
            "relative overflow-hidden",
            view.grid &&
              "bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:16px_16px]",
          )}
        >
          <div
            className={cn(
              "absolute flex h-16 w-28 items-center justify-center rounded-md border border-primary bg-background text-xs font-medium shadow-sm transition-[top,left] duration-200 ease-out motion-reduce:transition-none",
              view.snap ? "top-8 left-8" : "top-[2.3rem] left-[2.65rem]",
            )}
          >
            Sign-up card
          </div>
        </div>
      </div>
      <p className="border-t px-3 py-2 text-xs text-muted-foreground">
        Press Shift with a letter to switch a view option.
      </p>
    </div>
  );
}
