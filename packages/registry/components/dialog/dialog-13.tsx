"use client";

import * as React from "react";
import {
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderInput,
  FolderPlus,
  Search,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/base/ui/dialog";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

type FolderNode = {
  id: string;
  name: string;
  parent: string | null;
};

type FileEntry = {
  id: string;
  name: string;
  size: string;
  folder: string;
  kind: "doc" | "sheet";
};

const initialFolders: FolderNode[] = [
  { id: "root", name: "All files", parent: null },
  { id: "finance", name: "Finance", parent: "root" },
  { id: "finance-2026", name: "2026", parent: "finance" },
  { id: "finance-q3", name: "Q3 close", parent: "finance-2026" },
  { id: "legal", name: "Legal", parent: "root" },
  { id: "legal-contracts", name: "Vendor contracts", parent: "legal" },
  { id: "marketing", name: "Marketing", parent: "root" },
];

const initialFiles: FileEntry[] = [
  { id: "f1", name: "September invoices.xlsx", size: "184 KB", folder: "root", kind: "sheet" },
  { id: "f2", name: "Payroll summary.xlsx", size: "92 KB", folder: "root", kind: "sheet" },
  { id: "f3", name: "Board update draft.docx", size: "1.2 MB", folder: "root", kind: "doc" },
  { id: "f4", name: "Hosting agreement.pdf", size: "640 KB", folder: "root", kind: "doc" },
];

export default function Dialog13() {
  const [files, setFiles] = React.useState(initialFiles);
  const [folders, setFolders] = React.useState(initialFolders);
  const [checked, setChecked] = React.useState<string[]>(["f1", "f2"]);
  const [open, setOpen] = React.useState(false);
  const [location, setLocation] = React.useState("root");
  const [target, setTarget] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [notice, setNotice] = React.useState("");
  // The files and selection from before the last move, for Undo.
  const [undo, setUndo] = React.useState<{
    files: FileEntry[];
    checked: string[];
  } | null>(null);

  const byId = (id: string) => folders.find((folder) => folder.id === id);

  const pathTo = (id: string) => {
    const trail: FolderNode[] = [];
    let node = byId(id);
    while (node) {
      trail.unshift(node);
      node = node.parent ? byId(node.parent) : undefined;
    }
    return trail;
  };

  const needle = query.trim().toLowerCase();
  // Searching flattens the tree; browsing shows the children of one folder.
  const visible = needle
    ? folders.filter(
        (folder) =>
          folder.parent !== null && folder.name.toLowerCase().includes(needle),
      )
    : folders.filter((folder) => folder.parent === location);

  const destination = target ?? location;
  const selectedFiles = files.filter((file) => checked.includes(file.id));
  const sourceFolder = selectedFiles[0]?.folder;
  const isSameFolder = selectedFiles.every(
    (file) => file.folder === destination,
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setLocation("root");
      setTarget(null);
      setQuery("");
      setCreating(false);
      setNewName("");
    }
  };

  const browse = (id: string) => {
    setLocation(id);
    setTarget(null);
    setQuery("");
  };

  const createFolder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const id = `folder-${folders.length + 1}`;
    setFolders((current) => [...current, { id, name, parent: location }]);
    setTarget(id);
    setCreating(false);
    setNewName("");
  };

  const move = () => {
    const name = pathTo(destination)
      .map((folder) => folder.name)
      .join(" / ");
    setFiles((current) =>
      current.map((file) =>
        checked.includes(file.id) ? { ...file, folder: destination } : file,
      ),
    );
    setUndo({ files, checked });
    setNotice(
      `Moved ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"} to ${name}.`,
    );
    setChecked([]);
    setOpen(false);
  };

  const undoMove = () => {
    if (!undo) return;
    setFiles(undo.files);
    setChecked(undo.checked);
    setUndo(null);
    setNotice("Move undone.");
  };

  const rootFiles = files.filter((file) => file.folder === "root");

  return (
    <section
      aria-labelledby="dialog-13-heading"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 id="dialog-13-heading" className="font-medium">
          All files
        </h2>
        <Button
          size="sm"
          variant="outline"
          disabled={checked.length === 0}
          onClick={() => handleOpenChange(true)}
        >
          <FolderInput aria-hidden="true" data-icon="inline-start" />
          Move{checked.length > 0 ? ` ${checked.length}` : ""}
        </Button>
      </header>

      {rootFiles.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          This folder is empty.
        </p>
      ) : (
        <ul className="divide-y">
          {rootFiles.map((file) => {
            const Icon = file.kind === "sheet" ? FileSpreadsheet : FileText;
            return (
              <li key={file.id}>
                <Label className="cursor-pointer gap-3 px-4 py-2.5 font-normal leading-normal transition-colors hover:bg-muted/50 has-data-checked:bg-muted/60">
                  <Checkbox
                    checked={checked.includes(file.id)}
                    onCheckedChange={(value) =>
                      setChecked((current) =>
                        value
                          ? [...current, file.id]
                          : current.filter((id) => id !== file.id),
                      )
                    }
                  />
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {file.size}
                  </span>
                </Label>
              </li>
            );
          })}
        </ul>
      )}

      <div
        aria-live="polite"
        className="flex items-center justify-between gap-3 border-t px-4 py-2 text-xs text-muted-foreground empty:hidden"
      >
        {notice && <p className="min-w-0">{notice}</p>}
        {notice && undo && (
          <Button variant="ghost" size="xs" onClick={undoMove}>
            Undo
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[min(36rem,85vh)] grid-rows-[auto_auto_auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Move {selectedFiles.length}{" "}
              {selectedFiles.length === 1 ? "file" : "files"}
            </DialogTitle>
            <DialogDescription className="truncate">
              {selectedFiles.map((file) => file.name).join(", ")}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setTarget(null);
              }}
              placeholder="Search folders"
              aria-label="Search folders"
              className="pl-8"
            />
          </div>

          <nav aria-label="Folder path" className="min-w-0">
            <ol className="flex min-w-0 flex-wrap items-center gap-0.5 text-sm">
              {(needle ? [] : pathTo(location)).map((folder, index, trail) => {
                const isLast = index === trail.length - 1;
                return (
                  <li key={folder.id} className="flex items-center gap-0.5">
                    {isLast ? (
                      <span
                        aria-current="location"
                        className="px-1.5 py-0.5 font-medium"
                      >
                        {folder.name}
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => browse(folder.id)}
                          className="rounded-md px-1.5 py-0.5 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {folder.name}
                        </button>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-3.5 text-muted-foreground"
                        />
                      </>
                    )}
                  </li>
                );
              })}
              {needle && (
                <li className="px-1.5 py-0.5 text-muted-foreground">
                  {visible.length} {visible.length === 1 ? "match" : "matches"}
                </li>
              )}
            </ol>
          </nav>

          <div className="-mx-4 min-h-40 overflow-y-auto border-t px-2 py-1">
            {visible.length === 0 && !creating ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {needle
                  ? `No folder named “${query.trim()}”.`
                  : "No subfolders. Files will go directly here."}
              </p>
            ) : (
              <ul aria-label="Folders" className="grid gap-0.5">
                {visible.map((folder) => {
                  const hasChildren = folders.some(
                    (child) => child.parent === folder.id,
                  );
                  const isTarget = target === folder.id;
                  const isSource = folder.id === sourceFolder;
                  return (
                    <li
                      key={folder.id}
                      className="flex items-center gap-1 rounded-lg has-aria-pressed:bg-accent"
                    >
                      <button
                        type="button"
                        aria-pressed={isTarget || undefined}
                        disabled={isSource}
                        onClick={() => setTarget(isTarget ? null : folder.id)}
                        onDoubleClick={() => hasChildren && browse(folder.id)}
                        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 aria-pressed:hover:bg-transparent"
                      >
                        <Folder
                          aria-hidden="true"
                          className="size-4 shrink-0 fill-muted text-muted-foreground"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">
                            {folder.name}
                          </span>
                          {needle && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {pathTo(folder.parent ?? "root")
                                .map((node) => node.name)
                                .join(" / ")}
                            </span>
                          )}
                        </span>
                        {isSource && (
                          <span className="text-xs text-muted-foreground">
                            Current
                          </span>
                        )}
                      </button>
                      {hasChildren && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => browse(folder.id)}
                          aria-label={`Open ${folder.name}`}
                        >
                          <ChevronRight aria-hidden="true" />
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {creating && (
              <form onSubmit={createFolder} className="flex gap-2 p-1">
                <Input
                  autoFocus
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.stopPropagation();
                      setCreating(false);
                    }
                  }}
                  placeholder="Folder name"
                  aria-label="New folder name"
                />
                <Button type="submit" disabled={!newName.trim()}>
                  Create
                </Button>
              </form>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="ghost"
              disabled={creating || Boolean(needle)}
              onClick={() => setCreating(true)}
            >
              <FolderPlus aria-hidden="true" data-icon="inline-start" />
              New folder
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button disabled={isSameFolder} onClick={move}>
                Move to {byId(destination)?.name}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
