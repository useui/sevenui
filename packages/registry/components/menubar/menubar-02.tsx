"use client";

import {
  Clipboard,
  Copy,
  Download,
  FilePlus,
  FolderOpen,
  Image,
  LayoutGrid,
  Pencil,
  Save,
  Scissors,
  Table,
  Type,
} from "lucide-react";

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
  "gap-1.5 focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-3.5 [&_svg]:text-muted-foreground";

export default function Menubar02() {
  return (
    <Menubar aria-label="Whiteboard" className="w-fit max-w-full">
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>
          <FolderOpen aria-hidden="true" />
          File
        </MenubarTrigger>
        <MenubarContent className="min-w-48">
          <MenubarItem>
            <FilePlus aria-hidden="true" />
            New board
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Save aria-hidden="true" />
            Save
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            <Download aria-hidden="true" />
            Export as PNG
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>
          <Pencil aria-hidden="true" />
          Edit
        </MenubarTrigger>
        <MenubarContent className="min-w-48">
          <MenubarItem>
            <Scissors aria-hidden="true" />
            Cut
            <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Copy aria-hidden="true" />
            Copy
            <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Clipboard aria-hidden="true" />
            Paste
            <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>
          <LayoutGrid aria-hidden="true" />
          Insert
        </MenubarTrigger>
        <MenubarContent className="min-w-48">
          <MenubarItem>
            <Type aria-hidden="true" />
            Text box
            <MenubarShortcut>T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Image aria-hidden="true" />
            Image
            <MenubarShortcut>I</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            <Table aria-hidden="true" />
            Table
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
