"use client";

import * as React from "react";
import {
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  ImageIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Toaster, createToastManager } from "@/registry/base/ui/toast";

const toastManager = createToastManager();

const initialFiles = [
  {
    id: "q3-board-deck",
    name: "Q3 board deck.pdf",
    meta: "4.2 MB · Edited 2h ago",
    icon: FileTextIcon,
  },
  {
    id: "launch-budget",
    name: "Launch budget.xlsx",
    meta: "860 KB · Edited yesterday",
    icon: FileSpreadsheetIcon,
  },
  {
    id: "hero-shot",
    name: "Hero shot final.png",
    meta: "3.1 MB · Edited Sep 18",
    icon: ImageIcon,
  },
  {
    id: "onboarding-walkthrough",
    name: "Onboarding walkthrough.mp4",
    meta: "128 MB · Edited Sep 12",
    icon: FileVideoIcon,
  },
];

type FileEntry = (typeof initialFiles)[number];

export default function Toast10() {
  const [files, setFiles] = React.useState<FileEntry[]>(initialFiles);

  function restore(file: FileEntry) {
    setFiles((current) => {
      if (current.some((entry) => entry.id === file.id)) {
        return current;
      }
      // Put the file back in its original position.
      const order = initialFiles.map((entry) => entry.id);
      return [...current, file].sort(
        (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
      );
    });
  }

  function remove(file: FileEntry) {
    setFiles((current) => current.filter((entry) => entry.id !== file.id));

    const toastId = toastManager.add({
      title: "Moved to trash",
      description: `${file.name} will be deleted permanently in 30 days.`,
      timeout: 8000,
      actionProps: {
        children: (
          <>
            <RotateCcwIcon aria-hidden="true" />
            Undo
          </>
        ),
        "aria-label": `Undo deleting ${file.name}`,
        onClick: () => {
          restore(file);
          toastManager.close(toastId);
        },
      },
    });
  }

  return (
    <>
      <Toaster toastManager={toastManager} />
      <section
        aria-labelledby="toast-10-heading"
        className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground"
      >
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <h3 id="toast-10-heading" className="text-sm font-medium">
            Marketing / Q3 launch
          </h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {files.length} {files.length === 1 ? "file" : "files"}
          </span>
        </header>
        {files.length > 0 ? (
          <ul className="divide-y divide-border">
            {files.map((file) => {
              const Icon = file.icon;
              return (
                <li
                  key={file.id}
                  className="group flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {file.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {file.meta}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move ${file.name} to trash`}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(file)}
                  >
                    <Trash2Icon aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              This folder is empty.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiles(initialFiles)}
            >
              <RotateCcwIcon aria-hidden="true" />
              Restore all files
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
