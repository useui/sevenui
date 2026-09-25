"use client";

import * as React from "react";
import {
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  type LucideIcon,
} from "lucide-react";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

type Kind = "folder" | "document" | "sheet" | "image";

type Entry = {
  name: string;
  kind: Kind;
  size: number;
  modified: string;
  hidden?: boolean;
};

const icons: Record<Kind, LucideIcon> = {
  folder: Folder,
  document: FileText,
  sheet: FileSpreadsheet,
  image: FileImage,
};

const entries: Entry[] = [
  { name: "Brand assets", kind: "folder", size: 0, modified: "2026-09-21" },
  {
    name: "Q3 board deck.pdf",
    kind: "document",
    size: 4200,
    modified: "2026-09-18",
  },
  {
    name: "Revenue forecast.xlsx",
    kind: "sheet",
    size: 860,
    modified: "2026-09-24",
  },
  {
    name: "Launch banner.png",
    kind: "image",
    size: 2300,
    modified: "2026-09-12",
  },
  {
    name: "Onboarding copy.docx",
    kind: "document",
    size: 120,
    modified: "2026-09-23",
  },
  {
    name: ".sync-cache",
    kind: "document",
    size: 12,
    modified: "2026-09-25",
    hidden: true,
  },
];

const triggerClass = "focus-visible:ring-2 focus-visible:ring-ring/50";

function formatSize(kb: number) {
  if (kb === 0) return "—";
  return kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} KB`;
}

export default function Menubar10() {
  const [layout, setLayout] = React.useState("list");
  const [sortBy, setSortBy] = React.useState("modified");
  const [foldersFirst, setFoldersFirst] = React.useState(true);
  const [showHidden, setShowHidden] = React.useState(false);

  const visible = React.useMemo(() => {
    const list = entries.filter((entry) => showHidden || !entry.hidden);
    list.sort((a, b) => {
      if (foldersFirst && a.kind !== b.kind) {
        if (a.kind === "folder") return -1;
        if (b.kind === "folder") return 1;
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.size - a.size;
      return b.modified.localeCompare(a.modified);
    });
    return list;
  }, [sortBy, foldersFirst, showHidden]);

  return (
    <div className="w-full max-w-lg rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <Menubar aria-label="File browser">
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New folder
                <MenubarShortcut>⇧⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Upload files
                <MenubarShortcut>⌘U</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Download as ZIP</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>View</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={layout} onValueChange={setLayout}>
                <MenubarRadioItem value="list">As list</MenubarRadioItem>
                <MenubarRadioItem value="grid">As icons</MenubarRadioItem>
              </MenubarRadioGroup>
              <MenubarSeparator />
              <MenubarCheckboxItem
                checked={showHidden}
                onCheckedChange={(checked) => setShowHidden(checked)}
              >
                Show hidden files
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Sort</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={sortBy} onValueChange={setSortBy}>
                <MenubarLabel>Sort by</MenubarLabel>
                <MenubarRadioItem value="name">Name</MenubarRadioItem>
                <MenubarRadioItem value="modified">Date modified</MenubarRadioItem>
                <MenubarRadioItem value="size">Size</MenubarRadioItem>
              </MenubarRadioGroup>
              <MenubarSeparator />
              <MenubarCheckboxItem
                checked={foldersFirst}
                onCheckedChange={(checked) => setFoldersFirst(checked)}
              >
                Keep folders on top
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <span className="text-xs text-muted-foreground tabular-nums">
          {visible.length} items
        </span>
      </div>

      {layout === "list" ? (
        <ul aria-label="Files in Marketing" className="divide-y">
          {visible.map((entry) => {
            const Icon = icons[entry.kind];
            return (
              <li
                key={entry.name}
                className="flex items-center gap-3 px-3 py-2 text-sm"
              >
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
                  {entry.modified}
                </span>
                <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">
                  {formatSize(entry.size)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul
          aria-label="Files in Marketing"
          className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3"
        >
          {visible.map((entry) => {
            const Icon = icons[entry.kind];
            return (
              <li
                key={entry.name}
                className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 px-2 py-4 text-center"
              >
                <Icon
                  className="size-7 text-muted-foreground"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="w-full truncate text-xs font-medium">
                  {entry.name}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
