"use client";

import {
  Copy,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Folder,
  PencilLine,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

type Kind = "folder" | "doc" | "sheet" | "image" | "archive";
type FileEntry = { id: string; name: string; kind: Kind; meta: string };

const initialFiles: FileEntry[] = [
  { id: "f1", name: "Brand assets", kind: "folder", meta: "24 items" },
  { id: "f2", name: "Q3 roadmap.pdf", kind: "doc", meta: "1.2 MB" },
  { id: "f3", name: "Payroll Sept.xlsx", kind: "sheet", meta: "88 KB" },
  { id: "f4", name: "Hero photo.jpg", kind: "image", meta: "3.4 MB" },
  { id: "f5", name: "Contracts", kind: "folder", meta: "9 items" },
  { id: "f6", name: "Launch kit.zip", kind: "archive", meta: "56 MB" },
];

const icons = {
  folder: Folder,
  doc: FileText,
  sheet: FileSpreadsheet,
  image: FileImage,
  archive: FileArchive,
};

const COLUMNS = 3;

function usePrimaryModifier() {
  const [label, setLabel] = React.useState("Ctrl");
  React.useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setLabel("⌘");
  }, []);
  return label;
}

function copyName(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0
    ? `${name.slice(0, dot)} copy${name.slice(dot)}`
    : `${name} copy`;
}

export default function Kbd11() {
  const modifier = usePrimaryModifier();
  const [files, setFiles] = React.useState(initialFiles);
  const [active, setActive] = React.useState(0);
  const [renaming, setRenaming] = React.useState<string | null>(null);
  const [draftName, setDraftName] = React.useState("");
  const [deleted, setDeleted] = React.useState<{
    file: FileEntry;
    index: number;
  } | null>(null);
  const tileRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  // Set by Escape so the blur that follows does not save the draft name.
  const cancelRename = React.useRef(false);

  const current = files[active];

  // The undo bar replaces the actions, so let it go after a few seconds.
  React.useEffect(() => {
    if (!deleted) return;
    const id = window.setTimeout(() => setDeleted(null), 6000);
    return () => window.clearTimeout(id);
  }, [deleted]);

  function focusTile(index: number) {
    const next = Math.max(0, Math.min(files.length - 1, index));
    setActive(next);
    tileRefs.current[next]?.focus();
  }

  function startRename() {
    if (!current) return;
    setDeleted(null);
    cancelRename.current = false;
    setDraftName(current.name);
    setRenaming(current.id);
  }

  function commitRename() {
    if (!renaming) return;
    const name = draftName.trim();
    if (name && !cancelRename.current) {
      setFiles((prev) =>
        prev.map((f) => (f.id === renaming ? { ...f, name } : f)),
      );
    }
    cancelRename.current = false;
    setRenaming(null);
    requestAnimationFrame(() => tileRefs.current[active]?.focus());
  }

  function duplicate() {
    if (!current) return;
    setDeleted(null);
    const copy = {
      ...current,
      id: `${current.id}-${Date.now()}`,
      name: copyName(current.name),
    };
    setFiles((prev) => [
      ...prev.slice(0, active + 1),
      copy,
      ...prev.slice(active + 1),
    ]);
    setActive(active + 1);
    requestAnimationFrame(() => tileRefs.current[active + 1]?.focus());
  }

  function remove() {
    if (!current) return;
    setDeleted({ file: current, index: active });
    setFiles((prev) => prev.filter((f) => f.id !== current.id));
    const next = Math.max(0, Math.min(active, files.length - 2));
    setActive(next);
    requestAnimationFrame(() => tileRefs.current[next]?.focus());
  }

  function undo() {
    if (!deleted) return;
    const { file, index } = deleted;
    setFiles((prev) => [...prev.slice(0, index), file, ...prev.slice(index)]);
    setActive(index);
    setDeleted(null);
    requestAnimationFrame(() => tileRefs.current[index]?.focus());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (renaming) return;
    const mod = event.metaKey || event.ctrlKey;
    const key = event.key;

    if (key === "ArrowRight") focusTile(active + 1);
    else if (key === "ArrowLeft") focusTile(active - 1);
    else if (key === "ArrowDown") focusTile(active + COLUMNS);
    else if (key === "ArrowUp") focusTile(active - COLUMNS);
    else if (key === "Home") focusTile(0);
    else if (key === "End") focusTile(files.length - 1);
    else if (key === "F2" || (key === "Enter" && !mod)) startRename();
    else if (key === "Delete" || key === "Backspace") remove();
    else if (mod && key.toLowerCase() === "d") duplicate();
    else if (mod && key.toLowerCase() === "z") undo();
    else return;
    event.preventDefault();
  }

  return (
    <section
      aria-labelledby="kbd-11-title"
      className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-3">
        <h3 id="kbd-11-title" className="text-sm font-semibold">
          Shared drive{" "}
          <span className="text-muted-foreground">/ Marketing</span>
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {files.length} items
        </span>
      </header>

      <div
        role="listbox"
        aria-label="Files"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className="grid grid-cols-3 gap-2 px-4 pb-4"
      >
        {files.map((file, index) => {
          const Icon = icons[file.kind];
          const isActive = index === active;
          const isRenaming = renaming === file.id;
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: the listbox handles arrow keys, F2, and Delete
            <div
              key={file.id}
              ref={(el) => {
                tileRefs.current[index] = el;
              }}
              role="option"
              aria-selected={isActive}
              tabIndex={isActive && !isRenaming ? 0 : -1}
              onClick={() => setActive(index)}
              onDoubleClick={() => {
                setActive(index);
                setDeleted(null);
                cancelRename.current = false;
                setDraftName(file.name);
                setRenaming(file.id);
              }}
              className={
                isActive
                  ? "flex min-w-0 cursor-default flex-col items-center gap-1.5 rounded-lg bg-accent px-1.5 py-3 text-accent-foreground ring-1 ring-ring/40 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  : "flex min-w-0 cursor-default flex-col items-center gap-1.5 rounded-lg px-1.5 py-3 outline-none hover:bg-muted/60"
              }
            >
              <Icon
                aria-hidden="true"
                className={
                  file.kind === "folder"
                    ? "size-8 fill-muted stroke-[1.5] text-muted-foreground"
                    : "size-8 stroke-[1.5] text-muted-foreground"
                }
              />
              {isRenaming ? (
                <input
                  aria-label={`Rename ${file.name}`}
                  value={draftName}
                  // biome-ignore lint/a11y/noAutofocus: the user explicitly asked to rename this file
                  autoFocus
                  onFocus={(event) => {
                    const dot = event.target.value.lastIndexOf(".");
                    event.target.setSelectionRange(
                      0,
                      dot > 0 ? dot : event.target.value.length,
                    );
                  }}
                  onChange={(event) => setDraftName(event.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === "Enter") commitRename();
                    if (event.key === "Escape") {
                      cancelRename.current = true;
                      setRenaming(null);
                      tileRefs.current[index]?.focus();
                    }
                  }}
                  className="w-full min-w-0 rounded-sm border border-ring bg-background px-1 text-center text-xs outline-none ring-2 ring-ring/40"
                />
              ) : (
                <span className="line-clamp-2 w-full text-center text-xs font-medium wrap-anywhere">
                  {file.name}
                </span>
              )}
              <span className="text-[0.7rem] text-muted-foreground tabular-nums">
                {file.meta}
              </span>
            </div>
          );
        })}
      </div>

      <footer className="border-t bg-muted/30 px-2 py-2">
        {deleted ? (
          <div
            role="status"
            className="flex items-center justify-between gap-2 px-2 text-xs"
          >
            <span className="min-w-0 truncate">
              Moved “{deleted.file.name}” to trash
            </span>
            <Button variant="ghost" size="xs" onClick={undo}>
              Undo
              <KbdGroup>
                <Kbd>{modifier}</Kbd>
                <Kbd>Z</Kbd>
              </KbdGroup>
            </Button>
          </div>
        ) : renaming ? (
          <p className="flex items-center justify-center gap-3 px-2 py-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Kbd>Enter</Kbd> save
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Esc</Kbd> cancel
            </span>
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-1">
            <Button
              variant="ghost"
              size="xs"
              disabled={!current}
              onClick={startRename}
            >
              <PencilLine aria-hidden="true" data-icon="inline-start" />
              Rename <Kbd>F2</Kbd>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              disabled={!current}
              onClick={duplicate}
            >
              <Copy aria-hidden="true" data-icon="inline-start" />
              Duplicate
              <KbdGroup>
                <Kbd>{modifier}</Kbd>
                <Kbd>D</Kbd>
              </KbdGroup>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              disabled={!current}
              onClick={remove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 aria-hidden="true" data-icon="inline-start" />
              Delete <Kbd>Del</Kbd>
            </Button>
          </div>
        )}
      </footer>
    </section>
  );
}
