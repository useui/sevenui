"use client";

import * as React from "react";
import { Download, FileText, FolderInput, Trash2, X } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/registry/base/ui/drawer";

const initialFiles = [
  { id: "brief", name: "Brand brief.pdf", meta: "1.8 MB · Sep 12" },
  { id: "invoice", name: "Invoice 0421.pdf", meta: "240 KB · Sep 10" },
  { id: "contract", name: "Vendor contract.docx", meta: "96 KB · Sep 4" },
  { id: "notes", name: "Kickoff notes.md", meta: "12 KB · Aug 29" },
];

export default function Drawer05() {
  const [files, setFiles] = React.useState(initialFiles);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [notice, setNotice] = React.useState<string | null>(null);
  const count = selected.length;
  const noun = (n: number) => `${n} ${n === 1 ? "file" : "files"}`;

  const removeSelected = (message: string) => {
    setFiles((prev) => prev.filter((file) => !selected.includes(file.id)));
    setSelected([]);
    setNotice(message);
  };

  const toggle = (id: string, checked: boolean) => {
    setNotice(null);
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  return (
    <div className="w-full max-w-sm">
      {files.length === 0 && (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No files left.{" "}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4"
            onClick={() => {
              setFiles(initialFiles);
              setNotice(null);
            }}
          >
            Restore
          </button>
        </div>
      )}
      <ul
        hidden={files.length === 0}
        aria-label="Project files"
        className="flex flex-col divide-y rounded-xl border bg-card"
      >
        {files.map((file) => {
          const checked = selected.includes(file.id);
          return (
            <li key={file.id}>
              <label
                htmlFor={`drawer-05-${file.id}`}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 has-data-checked:bg-muted/50"
              >
                <Checkbox
                  id={`drawer-05-${file.id}`}
                  checked={checked}
                  onCheckedChange={(value) => toggle(file.id, value)}
                />
                <FileText
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {file.meta}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <p
        aria-live="polite"
        className="mt-3 text-center text-xs text-muted-foreground"
      >
        {notice ??
          "Select files. The action bar stays open while you keep working."}
      </p>

      <Drawer
        modal={false}
        disablePointerDismissal
        open={count > 0}
        onOpenChange={(open) => {
          if (!open) setSelected([]);
        }}
      >
        <DrawerContent
          initialFocus={false}
          finalFocus={false}
          className="mx-auto w-[calc(100%-1rem)] max-w-md"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <DrawerTitle aria-live="polite" className="text-sm">
                {count} {count === 1 ? "file" : "files"} selected
              </DrawerTitle>
              <DrawerDescription className="text-xs">
                Press Escape to clear
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Download"
                onClick={() =>
                  setNotice(`Downloading ${noun(count)} as a zip archive.`)
                }
              >
                <Download aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move to Archive"
                onClick={() =>
                  removeSelected(`Moved ${noun(count)} to Archive.`)
                }
              >
                <FolderInput aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeSelected(`Deleted ${noun(count)}.`)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Clear selection"
                onClick={() => setSelected([])}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
