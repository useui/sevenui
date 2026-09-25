"use client";

import * as React from "react";
import {
  PanelBottomIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PanelTopIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Side = "top" | "right" | "bottom" | "left";

const sides: { value: Side; label: string; icon: typeof PanelTopIcon }[] = [
  { value: "left", label: "Left", icon: PanelLeftIcon },
  { value: "top", label: "Top", icon: PanelTopIcon },
  { value: "bottom", label: "Bottom", icon: PanelBottomIcon },
  { value: "right", label: "Right", icon: PanelRightIcon },
];

const shortcuts = [
  { action: "Open command menu", keys: ["⌘", "K"] },
  { action: "Create new issue", keys: ["C"] },
  { action: "Search in project", keys: ["/"] },
  { action: "Toggle sidebar", keys: ["⌘", "B"] },
];

export default function Sheet01() {
  const [side, setSide] = React.useState<Side>("right");
  const isHorizontal = side === "top" || side === "bottom";

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <span id="sheet-01-edge" className="text-sm text-muted-foreground">
          Slide in from
        </span>
        <ToggleGroup
          aria-labelledby="sheet-01-edge"
          variant="outline"
          spacing={0}
          value={[side]}
          onValueChange={(value) => {
            const next = value[0] as Side | undefined;
            if (next) setSide(next);
          }}
        >
          {sides.map(({ value, label, icon: Icon }) => (
            <ToggleGroupItem key={value} value={value} aria-label={label}>
              <Icon aria-hidden="true" />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Sheet>
        <SheetTrigger
          render={<Button className="w-full">Keyboard shortcuts</Button>}
        />
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Keyboard shortcuts</SheetTitle>
            <SheetDescription>
              Move through the workspace without leaving the keyboard.
            </SheetDescription>
          </SheetHeader>
          <ul
            className={
              isHorizontal
                ? "grid gap-x-8 gap-y-3 px-4 pb-6 sm:grid-cols-2"
                : "grid gap-3 px-4"
            }
          >
            {shortcuts.map((shortcut) => (
              <li
                key={shortcut.action}
                className="flex items-center justify-between gap-4"
              >
                <span>{shortcut.action}</span>
                <KbdGroup>
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </KbdGroup>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
