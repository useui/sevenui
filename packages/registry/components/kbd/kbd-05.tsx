"use client";

import * as React from "react";

import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Platform = "mac" | "windows";

const modifiers: Record<Platform, Record<string, { glyph: string; name: string }>> =
  {
    mac: {
      mod: { glyph: "⌘", name: "Command" },
      alt: { glyph: "⌥", name: "Option" },
      shift: { glyph: "⇧", name: "Shift" },
    },
    windows: {
      mod: { glyph: "Ctrl", name: "Control" },
      alt: { glyph: "Alt", name: "Alt" },
      shift: { glyph: "Shift", name: "Shift" },
    },
  };

const shortcuts = [
  { action: "Duplicate layer", keys: ["mod", "D"] },
  { action: "Group selection", keys: ["mod", "G"] },
  { action: "Export as PNG", keys: ["shift", "mod", "E"] },
  { action: "Copy properties", keys: ["alt", "mod", "C"] },
];

export default function Kbd05() {
  const [platform, setPlatform] = React.useState<Platform>("mac");

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span id="kbd-platform-label" className="text-sm font-medium">
          Show shortcuts for
        </span>
        <ToggleGroup
          aria-labelledby="kbd-platform-label"
          variant="outline"
          size="sm"
          spacing={0}
          value={[platform]}
          onValueChange={(next) => {
            // Keep one platform selected at all times.
            if (next.length > 0) setPlatform(next[0] as Platform);
          }}
        >
          <ToggleGroupItem value="mac">macOS</ToggleGroupItem>
          <ToggleGroupItem value="windows">Windows</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <ul className="divide-y divide-border rounded-xl border bg-card text-card-foreground">
        {shortcuts.map((shortcut) => {
          const keys = shortcut.keys.map(
            (key) => modifiers[platform][key] ?? { glyph: key, name: key },
          );
          return (
            <li
              key={shortcut.action}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm sm:px-4"
            >
              <span className="min-w-0 truncate">{shortcut.action}</span>
              <span className="sr-only">
                {keys.map((key) => key.name).join(" ")}
              </span>
              <KbdGroup aria-hidden="true" className="shrink-0">
                {keys.map((key) => (
                  <Kbd
                    key={`${platform}-${key.name}`}
                    className="animate-in fade-in-0 zoom-in-95 duration-200 motion-reduce:animate-none"
                  >
                    {key.glyph}
                  </Kbd>
                ))}
              </KbdGroup>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
