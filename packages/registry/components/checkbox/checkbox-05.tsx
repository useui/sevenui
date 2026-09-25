"use client";

import * as React from "react";
import { ChevronRightIcon, FolderIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";

// Swaps the default check for a dash while the box is indeterminate.
const mixedIndicator =
  "data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-indeterminate:[&_svg]:hidden data-indeterminate:before:h-0.5 data-indeterminate:before:w-2 data-indeterminate:before:rounded-full data-indeterminate:before:bg-current";

type Folder = {
  id: string;
  name: string;
  // Only leaf folders carry a size; parents sum their children.
  sizeGb?: number;
  children?: Folder[];
};

const tree: Folder[] = [
  {
    id: "design",
    name: "Design",
    children: [
      {
        id: "brand",
        name: "Brand assets",
        children: [
          { id: "logos", name: "Logos", sizeGb: 1.2 },
          { id: "photography", name: "Photography", sizeGb: 8.4 },
        ],
      },
      { id: "figma", name: "Figma exports", sizeGb: 3.1 },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    children: [
      { id: "builds", name: "Release builds", sizeGb: 14.6 },
      { id: "specs", name: "Specs", sizeGb: 0.4 },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    children: [
      { id: "invoices", name: "Invoices 2026", sizeGb: 0.9 },
      { id: "decks", name: "Board decks", sizeGb: 2.3 },
    ],
  },
];

const FREE_SPACE_GB = 20;

function leaves(folder: Folder): Folder[] {
  return folder.children ? folder.children.flatMap(leaves) : [folder];
}

function sizeOf(folders: Folder[]) {
  return folders.reduce((sum, folder) => sum + (folder.sizeGb ?? 0), 0);
}

const initialSynced = ["logos", "figma", "specs", "invoices", "decks"];

export default function Checkbox05() {
  const id = React.useId();
  const [synced, setSynced] = React.useState<string[]>(initialSynced);
  const [open, setOpen] = React.useState<string[]>(["design", "brand"]);
  // What is already on this Mac; "Update sync" moves the baseline.
  const [applied, setApplied] = React.useState<string[]>(initialSynced);
  const [justSynced, setJustSynced] = React.useState(false);

  const syncedSize = sizeOf(
    tree.flatMap(leaves).filter((leaf) => synced.includes(leaf.id)),
  );
  const appliedSize = sizeOf(
    tree.flatMap(leaves).filter((leaf) => applied.includes(leaf.id)),
  );
  const initialSize = sizeOf(
    tree.flatMap(leaves).filter((leaf) => initialSynced.includes(leaf.id)),
  );
  // Syncing more folders uses up disk; making some online-only frees it.
  const freeSpace = FREE_SPACE_GB + initialSize - appliedSize;
  const extra = syncedSize - appliedSize;
  const overLimit = extra > freeSpace;
  const dirty =
    synced.length !== applied.length ||
    synced.some((leaf) => !applied.includes(leaf));

  function setMany(ids: string[], checked: boolean) {
    setJustSynced(false);
    setSynced((current) =>
      checked
        ? [...new Set([...current, ...ids])]
        : current.filter((value) => !ids.includes(value)),
    );
  }

  function renderFolder(folder: Folder, depth: number) {
    const ids = leaves(folder).map((leaf) => leaf.id);
    const count = ids.filter((leaf) => synced.includes(leaf)).length;
    const isOpen = open.includes(folder.id);
    const checkboxId = `${id}-${folder.id}`;
    const groupId = `${id}-${folder.id}-group`;
    const size = sizeOf(leaves(folder));

    return (
      <li key={folder.id}>
        <div
          className="flex items-center gap-2 rounded-md py-1.5 pe-2 hover:bg-muted/60"
          style={{ paddingInlineStart: `${depth * 1.25 + 0.25}rem` }}
        >
          {folder.children ? (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-expanded={isOpen}
              aria-controls={groupId}
              aria-label={`${isOpen ? "Collapse" : "Expand"} ${folder.name}`}
              onClick={() =>
                setOpen((current) =>
                  isOpen
                    ? current.filter((value) => value !== folder.id)
                    : [...current, folder.id],
                )
              }
            >
              <ChevronRightIcon
                aria-hidden="true"
                className="transition-transform duration-200 ease-out data-[open=true]:rotate-90 motion-reduce:transition-none"
                data-open={isOpen}
              />
            </Button>
          ) : (
            <span aria-hidden="true" className="size-6 shrink-0" />
          )}
          <Checkbox
            id={checkboxId}
            className={mixedIndicator}
            checked={count === ids.length}
            indeterminate={count > 0 && count < ids.length}
            onCheckedChange={(checked) => setMany(ids, checked)}
          />
          <label
            htmlFor={checkboxId}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm select-none"
          >
            <FolderIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="truncate">{folder.name}</span>
          </label>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {size.toFixed(1)} GB
          </span>
        </div>
        {folder.children && isOpen ? (
          <ul id={groupId} aria-label={folder.name}>
            {folder.children.map((child) => renderFolder(child, depth + 1))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card text-card-foreground">
      <div className="border-b border-border px-4 py-3">
        <p id={`${id}-title`} className="text-sm font-medium">
          Selective sync
        </p>
        <p className="text-xs text-muted-foreground">
          Unchecked folders stay online only and free up space on this Mac.
        </p>
      </div>
      <ul aria-labelledby={`${id}-title`} className="p-2">
        {tree.map((folder) => renderFolder(folder, 0))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums data-[over=true]:text-destructive"
          data-over={overLimit}
        >
          {overLimit
            ? `Needs ${extra.toFixed(1)} GB, only ${freeSpace.toFixed(1)} GB free`
            : justSynced
              ? `Synced. ${syncedSize.toFixed(1)} GB on this Mac`
              : `${syncedSize.toFixed(1)} GB on this Mac`}
        </p>
        <Button
          size="sm"
          disabled={!dirty || overLimit}
          onClick={() => {
            setApplied(synced);
            setJustSynced(true);
          }}
        >
          Update sync
        </Button>
      </div>
    </div>
  );
}
