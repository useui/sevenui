"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

const triggerClass =
  "text-muted-foreground hover:bg-transparent hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-expanded:bg-transparent aria-expanded:text-foreground";

export default function Menubar01() {
  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col gap-1 border-b pb-2">
        <p className="truncate text-sm font-semibold">
          Q3 onboarding interviews
        </p>
        <Menubar
          aria-label="Document"
          className="-ml-1.5 h-auto border-0 p-0"
        >
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Make a copy
                <MenubarShortcut>⌘D</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Move to folder</MenubarItem>
              <MenubarItem>Version history</MenubarItem>
              <MenubarSeparator />
              <MenubarItem variant="destructive">Move to trash</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Undo
                <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Redo
                <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Find and replace
                <MenubarShortcut>⌘H</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Insert</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Image</MenubarItem>
              <MenubarItem>Table</MenubarItem>
              <MenubarItem>Horizontal line</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Keyboard shortcuts</MenubarItem>
              <MenubarItem>What&apos;s new</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
}
