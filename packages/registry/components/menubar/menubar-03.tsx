"use client";

import { cn } from "cn";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

const densities = [
  {
    label: "Compact",
    hint: "28px",
    bar: "h-7 p-0.5",
    trigger: "px-1.5 py-0 text-xs",
    item: "py-0.5 text-xs",
  },
  {
    label: "Default",
    hint: "32px",
    bar: "",
    trigger: "",
    item: "",
  },
  {
    label: "Comfortable",
    hint: "40px",
    bar: "h-10 gap-1 p-1",
    trigger: "px-3 py-1.5",
    item: "px-2 py-1.5",
  },
];

const menus = [
  {
    name: "File",
    items: [
      ["New project", "⌘N"],
      ["Open recent", "⌘O"],
    ],
  },
  {
    name: "Edit",
    items: [
      ["Undo", "⌘Z"],
      ["Redo", "⇧⌘Z"],
    ],
  },
  {
    name: "View",
    items: [
      ["Zoom in", "⌘+"],
      ["Zoom out", "⌘-"],
    ],
  },
];

export default function Menubar03() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {densities.map((density) => (
        <div
          key={density.label}
          className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
        >
          <Menubar
            aria-label={`${density.label} menubar`}
            className={density.bar}
          >
            {menus.map((menu) => (
              <MenubarMenu key={menu.name}>
                <MenubarTrigger
                  className={cn(
                    "focus-visible:ring-2 focus-visible:ring-ring/50",
                    density.trigger,
                  )}
                >
                  {menu.name}
                </MenubarTrigger>
                <MenubarContent>
                  {menu.items.map(([label, shortcut]) => (
                    <MenubarItem key={label} className={density.item}>
                      {label}
                      <MenubarShortcut>{shortcut}</MenubarShortcut>
                    </MenubarItem>
                  ))}
                </MenubarContent>
              </MenubarMenu>
            ))}
          </Menubar>
          <p className="text-xs text-muted-foreground">
            {density.label}{" "}
            <span className="tabular-nums">· {density.hint}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
