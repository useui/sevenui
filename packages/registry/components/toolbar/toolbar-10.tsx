"use client";

import {
  ArrowDownUpIcon,
  ChevronRightIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  FolderPlusIcon,
  ImageIcon,
  LayoutGridIcon,
  ListIcon,
} from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Toggle } from "@/registry/base/ui/toggle";
import { ToggleGroup } from "@/registry/base/ui/toggle-group";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

type Entry = {
  name: string;
  kind: "folder" | "doc" | "sheet" | "image";
  size: number;
  modified: string;
  modifiedAt: number;
};

const path = ["Workspace", "Marketing", "Q4 launch"];

const initialEntries: Entry[] = [
  {
    name: "Press kit",
    kind: "folder",
    size: 0,
    modified: "Sep 22",
    modifiedAt: 22,
  },
  {
    name: "Launch brief.docx",
    kind: "doc",
    size: 48,
    modified: "Sep 24",
    modifiedAt: 24,
  },
  {
    name: "Budget forecast.xlsx",
    kind: "sheet",
    size: 212,
    modified: "Sep 19",
    modifiedAt: 19,
  },
  {
    name: "Hero banner.png",
    kind: "image",
    size: 1840,
    modified: "Sep 23",
    modifiedAt: 23,
  },
  {
    name: "Email sequence.docx",
    kind: "doc",
    size: 31,
    modified: "Sep 17",
    modifiedAt: 17,
  },
];

const icons = {
  folder: FolderIcon,
  doc: FileTextIcon,
  sheet: FileSpreadsheetIcon,
  image: ImageIcon,
};

const sortLabels: Record<string, string> = {
  name: "Name",
  modified: "Last modified",
  size: "File size",
};

function formatSize(entry: Entry) {
  if (entry.kind === "folder") return "Folder";
  return entry.size >= 1000
    ? `${(entry.size / 1000).toFixed(1)} MB`
    : `${entry.size} KB`;
}

export default function Toolbar10() {
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("name");
  const [entries, setEntries] = useState(initialEntries);

  const sorted = [...entries].sort((a, b) => {
    if (a.kind === "folder" && b.kind !== "folder") return -1;
    if (b.kind === "folder" && a.kind !== "folder") return 1;
    if (sort === "size") return b.size - a.size;
    if (sort === "modified") return b.modifiedAt - a.modifiedAt;
    return a.name.localeCompare(b.name);
  });

  function createFolder() {
    const taken = entries.filter((entry) =>
      entry.name.startsWith("Untitled folder"),
    ).length;
    setEntries((current) => [
      ...current,
      {
        name: taken === 0 ? "Untitled folder" : `Untitled folder ${taken + 1}`,
        kind: "folder",
        size: 0,
        modified: "Just now",
        modifiedAt: 99,
      },
    ]);
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
      <Toolbar
        aria-label="File browser"
        className="w-full flex-wrap rounded-none border-0 border-b bg-transparent px-2 shadow-none"
      >
        <nav
          aria-label="Folder path"
          className="flex min-w-0 basis-full sm:flex-1 sm:basis-auto"
        >
          <ol className="flex min-w-0 items-center">
            {path.map((segment, index) => {
              const current = index === path.length - 1;
              return (
                <li
                  key={segment}
                  className={
                    current
                      ? "flex min-w-0 items-center"
                      : "flex min-w-0 shrink items-center"
                  }
                >
                  {current ? (
                    <ToolbarLink
                      href="#"
                      onClick={(event) => event.preventDefault()}
                      aria-current="page"
                      className="truncate font-medium text-foreground"
                    >
                      {segment}
                    </ToolbarLink>
                  ) : (
                    <>
                      <ToolbarLink
                        href="#"
                        // Demo path: stay put instead of jumping to the page top.
                        onClick={(event) => event.preventDefault()}
                        className="min-w-0 truncate"
                      >
                        {segment}
                      </ToolbarLink>
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-muted-foreground"
                      />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <DropdownMenu>
          <ToolbarButton
            render={<DropdownMenuTrigger />}
            aria-label={`Sort by ${sortLabels[sort]}`}
          >
            <ArrowDownUpIcon aria-hidden="true" />
            <span className="hidden sm:inline">{sortLabels[sort]}</span>
          </ToolbarButton>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(value) => setSort(value as string)}
              >
                {Object.entries(sortLabels).map(([value, label]) => (
                  <DropdownMenuRadioItem
                    key={value}
                    value={value}
                    closeOnClick
                  >
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarSeparator />

        <ToggleGroup
          aria-label="Layout"
          value={[view]}
          onValueChange={(value) => {
            if (value.length > 0) setView(value[0] as string);
          }}
        >
          <ToolbarButton
            render={<Toggle />}
            value="grid"
            aria-label="Grid view"
          >
            <LayoutGridIcon aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            render={<Toggle />}
            value="list"
            aria-label="List view"
          >
            <ListIcon aria-hidden="true" />
          </ToolbarButton>
        </ToggleGroup>

        <ToolbarSeparator />

        <ToolbarGroup aria-label="Create">
          <ToolbarButton aria-label="New folder" onClick={createFolder}>
            <FolderPlusIcon aria-hidden="true" />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>

      {view === "grid" ? (
        <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
          {sorted.map((entry) => {
            const Icon = icons[entry.kind];
            return (
              <li
                key={entry.name}
                className="flex flex-col gap-2 rounded-lg border bg-background p-3"
              >
                <Icon
                  aria-hidden="true"
                  className={
                    entry.kind === "folder"
                      ? "size-6 fill-muted text-muted-foreground"
                      : "size-6 text-muted-foreground"
                  }
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {entry.name}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatSize(entry)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="flex flex-col divide-y">
          {sorted.map((entry) => {
            const Icon = icons[entry.kind];
            return (
              <li
                key={entry.name}
                className="flex items-center gap-3 px-4 py-2 text-sm"
              >
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                <span className="hidden w-16 text-right text-xs text-muted-foreground sm:block">
                  {entry.modified}
                </span>
                <span className="w-16 text-right text-xs text-muted-foreground tabular-nums">
                  {formatSize(entry)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        {entries.length} items · 2.1 MB of 15 GB used
      </p>
    </div>
  );
}
