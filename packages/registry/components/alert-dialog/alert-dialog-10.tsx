"use client";

import * as React from "react";
import { FileImage, FileSpreadsheet, FileText, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";

type FileRow = {
  id: string;
  name: string;
  kind: "doc" | "sheet" | "image";
  sizeMb: number;
  modified: string;
};

const initialFiles: FileRow[] = [
  {
    id: "f-1",
    name: "Q3 board deck.pdf",
    kind: "doc",
    sizeMb: 18.4,
    modified: "Sep 21",
  },
  {
    id: "f-2",
    name: "Revenue model v7.xlsx",
    kind: "sheet",
    sizeMb: 2.1,
    modified: "Sep 19",
  },
  {
    id: "f-3",
    name: "Offsite venue photo.jpg",
    kind: "image",
    sizeMb: 6.8,
    modified: "Sep 12",
  },
  {
    id: "f-4",
    name: "Hiring plan draft.docx",
    kind: "doc",
    sizeMb: 0.4,
    modified: "Aug 30",
  },
  {
    id: "f-5",
    name: "Logo exploration.png",
    kind: "image",
    sizeMb: 11.2,
    modified: "Aug 22",
  },
];

const icons = { doc: FileText, sheet: FileSpreadsheet, image: FileImage };

export default function AlertDialog10() {
  const [files, setFiles] = React.useState(initialFiles);
  const [selected, setSelected] = React.useState<string[]>(["f-3", "f-5"]);
  const [open, setOpen] = React.useState(false);
  // Snapshot of what the dialog is about, frozen while it is open.
  const [doomed, setDoomed] = React.useState<FileRow[]>([]);

  const allSelected = files.length > 0 && selected.length === files.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggle = (id: string, checked: boolean) => {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );
  };

  const requestDelete = () => {
    setDoomed(files.filter((file) => selected.includes(file.id)));
    setOpen(true);
  };

  const confirmDelete = () => {
    const ids = new Set(doomed.map((file) => file.id));
    setFiles((current) => current.filter((file) => !ids.has(file.id)));
    setSelected([]);
  };

  const freed = doomed.reduce((sum, file) => sum + file.sizeMb, 0);
  const shown = doomed.slice(0, 3);
  const hidden = doomed.length - shown.length;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex h-12 items-center gap-3 border-b px-4">
        <Checkbox
          aria-label="Select all files"
          checked={allSelected}
          indeterminate={someSelected}
          disabled={files.length === 0}
          onCheckedChange={(checked) =>
            setSelected(checked ? files.map((file) => file.id) : [])
          }
        />
        <p className="flex-1 text-sm font-medium" aria-live="polite">
          {selected.length > 0
            ? `${selected.length} selected`
            : "Shared with Finance"}
        </p>
        <Button
          variant="destructive"
          size="sm"
          disabled={selected.length === 0}
          onClick={requestDelete}
        >
          <Trash2 aria-hidden="true" />
          Delete
        </Button>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">This folder is empty.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiles(initialFiles)}
          >
            Restore sample files
          </Button>
        </div>
      ) : (
        <ul>
          {files.map((file) => {
            const Icon = icons[file.kind];
            const checked = selected.includes(file.id);
            const checkboxId = `alert-dialog-10-${file.id}`;
            return (
              <li
                key={file.id}
                data-selected={checked || undefined}
                className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0 data-selected:bg-muted/60"
              >
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  onCheckedChange={(value) => toggle(file.id, value)}
                />
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <label
                  htmlFor={checkboxId}
                  className="min-w-0 flex-1 truncate text-sm"
                >
                  {file.name}
                </label>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {file.modified}
                </span>
                <span className="w-14 text-right text-xs text-muted-foreground tabular-nums">
                  {file.sizeMb.toFixed(1)} MB
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {doomed.length} {doomed.length === 1 ? "file" : "files"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Everyone in Finance loses access, and shared links stop working.
              This frees {freed.toFixed(1)} MB of storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul
            aria-label="Files to delete"
            className="flex flex-col gap-1.5 rounded-lg border p-3 text-sm"
          >
            {shown.map((file) => {
              const Icon = icons[file.kind];
              return (
                <li key={file.id} className="flex items-center gap-2">
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">{file.name}</span>
                </li>
              );
            })}
            {hidden > 0 ? (
              <li className="pl-6 text-muted-foreground">and {hidden} more</li>
            ) : null}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
