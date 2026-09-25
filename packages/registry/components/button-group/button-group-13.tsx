"use client";

import {
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FolderIcon,
  ImageIcon,
  LayoutGridIcon,
  ListIcon,
  type LucideIcon,
  Share2Icon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";
import { Checkbox } from "@/registry/base/ui/checkbox";

type FileEntry = {
  id: string;
  name: string;
  meta: string;
  icon: LucideIcon;
};

const initialFiles: FileEntry[] = [
  { id: "brand", name: "Brand assets", meta: "24 items", icon: FolderIcon },
  { id: "roadmap", name: "2027 roadmap.pdf", meta: "2.4 MB", icon: FileTextIcon },
  { id: "forecast", name: "Revenue forecast.xlsx", meta: "860 KB", icon: FileSpreadsheetIcon },
  { id: "hero", name: "Homepage hero.png", meta: "3.1 MB", icon: ImageIcon },
  { id: "notes", name: "Board meeting notes.docx", meta: "142 KB", icon: FileTextIcon },
  { id: "team", name: "Team offsite.jpg", meta: "4.8 MB", icon: ImageIcon },
];

type View = "list" | "grid";

const pressedClass =
  "aria-pressed:bg-muted aria-pressed:text-foreground dark:aria-pressed:bg-input/60";

export default function ButtonGroup13() {
  const [files, setFiles] = useState(initialFiles);
  const [selected, setSelected] = useState<string[]>(["roadmap", "forecast"]);
  const [view, setView] = useState<View>("list");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const countLabel = (count: number) =>
    `${count} ${count === 1 ? "file" : "files"}`;

  const share = async () => {
    try {
      await navigator.clipboard?.writeText("https://acme.app/share/q4-planning");
    } catch {
      // Clipboard access can be denied; the confirmation still reflects intent.
    }
    setNotice(`Share link for ${countLabel(selected.length)} copied.`);
  };

  const toggle = (id: string, checked: boolean) =>
    setSelected((list) =>
      checked ? [...list, id] : list.filter((item) => item !== id),
    );

  const allSelected = files.length > 0 && selected.length === files.length;

  return (
    <div className="flex w-full max-w-lg flex-col rounded-xl border bg-card text-card-foreground">
      <div
        className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
      >
        {selected.length > 0 ? (
          <ButtonGroup aria-label="Selection actions">
            <ButtonGroupText className="bg-background pr-1 tabular-nums">
              {selected.length} selected
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Clear selection"
                onClick={() => setSelected([])}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </ButtonGroupText>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setNotice(`Preparing ${countLabel(selected.length)} for download…`)
              }
            >
              <DownloadIcon aria-hidden="true" data-icon="inline-start" />
              <span className="sr-only sm:not-sr-only">Download</span>
            </Button>
            <Button variant="outline" size="sm" onClick={share}>
              <Share2Icon aria-hidden="true" data-icon="inline-start" />
              <span className="sr-only sm:not-sr-only">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setFiles((list) => list.filter((file) => !selected.includes(file.id)));
                setNotice(`${countLabel(selected.length)} moved to trash.`);
                setSelected([]);
              }}
            >
              <Trash2Icon aria-hidden="true" data-icon="inline-start" />
              <span className="sr-only sm:not-sr-only">Delete</span>
            </Button>
          </ButtonGroup>
        ) : (
          <div className="flex flex-col">
            <span className="text-sm font-medium">Q4 planning</span>
            <span className="text-xs text-muted-foreground">
              {files.length} items · Shared with Finance
            </span>
          </div>
        )}
        <ButtonGroup aria-label="Layout">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={pressedClass}
          >
            <ListIcon aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
            className={pressedClass}
          >
            <LayoutGridIcon aria-hidden="true" />
          </Button>
        </ButtonGroup>
      </div>
      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <p className="text-sm font-medium">This folder is empty</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiles(initialFiles)}
          >
            Restore deleted files
          </Button>
        </div>
      ) : view === "list" ? (
        <ul className="flex flex-col p-1">
          <li className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground">
            <Checkbox
              aria-label="Select all files"
              checked={allSelected}
              indeterminate={selected.length > 0 && !allSelected}
              onCheckedChange={(checked) =>
                setSelected(checked ? files.map((file) => file.id) : [])
              }
            />
            Name
          </li>
          {files.map((file) => {
            const Icon = file.icon;
            const isSelected = selected.includes(file.id);
            return (
              <li
                key={file.id}
                data-selected={isSelected || undefined}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/60 data-selected:bg-accent"
              >
                <Checkbox
                  aria-label={`Select ${file.name}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => toggle(file.id, checked)}
                />
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {file.meta}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
          {files.map((file) => {
            const Icon = file.icon;
            const isSelected = selected.includes(file.id);
            return (
              <li
                key={file.id}
                data-selected={isSelected || undefined}
                className="relative flex flex-col gap-2 rounded-lg border p-3 data-selected:border-ring data-selected:bg-accent"
              >
                <Checkbox
                  aria-label={`Select ${file.name}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => toggle(file.id, checked)}
                  className="absolute top-2 right-2"
                />
                <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {file.meta}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p
        aria-live="polite"
        className="border-t px-4 text-xs text-muted-foreground empty:hidden [&:not(:empty)]:py-2"
      >
        {notice}
      </p>
    </div>
  );
}
