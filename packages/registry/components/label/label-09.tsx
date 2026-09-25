"use client";

import { cn } from "cn";
import { CircleCheck, FileText, UploadCloud, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { Spinner } from "@/registry/base/ui/spinner";

type QueuedFile = { id: string; name: string; size: number };

const initialQueue: QueuedFile[] = [
  { id: "seed-1", name: "q3-board-deck.pdf", size: 4_812_000 },
  { id: "seed-2", name: "revenue-by-region.csv", size: 184_300 },
];

const folders = ["Finance / Q3 close", "Finance / Board", "Shared with auditors"];

function formatSize(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
}

export default function Label09() {
  const [queue, setQueue] = React.useState<QueuedFile[]>(initialQueue);
  const [dragging, setDragging] = React.useState(false);
  const [folder, setFolder] = React.useState(folders[0]);
  const [uploading, setUploading] = React.useState(false);
  const [uploaded, setUploaded] = React.useState<string | null>(null);
  const nextId = React.useRef(0);

  React.useEffect(() => {
    if (!uploading) return;
    const timer = window.setTimeout(() => {
      setUploaded(
        `${queue.length === 1 ? "1 file" : `${queue.length} files`} uploaded to ${folder}.`,
      );
      setQueue([]);
      setUploading(false);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [uploading, queue.length, folder]);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setUploaded(null);
    const next = Array.from(list, (file) => {
      nextId.current += 1;
      return { id: `file-${nextId.current}`, name: file.name, size: file.size };
    });
    setQueue((current) => [...current, ...next]);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground">
      <h3 className="text-base font-semibold">Upload files</h3>

      <Label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          // Moving over the zone's own children also fires dragleave.
          if (event.currentTarget.contains(event.relatedTarget as Node | null))
            return;
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "cursor-pointer flex-col justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-8 text-center transition-colors hover:bg-muted/50 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
          dragging && "border-primary bg-muted",
        )}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.csv,.xlsx"
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <span className="flex size-10 items-center justify-center rounded-full bg-muted">
          <UploadCloud aria-hidden="true" className="size-5 text-muted-foreground" />
        </span>
        <span>
          {dragging ? "Drop to add files" : "Drop files or browse"}
        </span>
        <span className="text-xs font-normal text-muted-foreground">
          PDF, CSV, or XLSX up to 25 MB each
        </span>
      </Label>

      {queue.length > 0 ? (
        <ul aria-label="Files to upload" className="flex flex-col gap-2">
          {queue.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatSize(file.size)}
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${file.name}`}
                disabled={uploading}
                onClick={() =>
                  setQueue((current) => current.filter((item) => item.id !== file.id))
                }
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="label-09-folder">Upload to</Label>
        <NativeSelect
          id="label-09-folder"
          value={folder}
          onChange={(event) => setFolder(event.target.value)}
          disabled={uploading}
          className="w-full"
        >
          {folders.map((folder) => (
            <NativeSelectOption key={folder} value={folder}>
              {folder}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {uploaded ? (
        <p className="flex items-center gap-1.5 text-xs text-success">
          <CircleCheck aria-hidden="true" className="size-3.5 shrink-0" />
          {uploaded}
        </p>
      ) : null}

      <Button
        disabled={queue.length === 0 || uploading}
        className="w-full"
        onClick={() => setUploading(true)}
      >
        {uploading ? (
          <>
            <Spinner />
            Uploading…
          </>
        ) : queue.length === 1 ? (
          "Upload 1 file"
        ) : (
          `Upload ${queue.length} files`
        )}
      </Button>
      <p aria-live="polite" className="sr-only">
        {uploaded ?? ""}
      </p>
    </div>
  );
}
