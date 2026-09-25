"use client";

import * as React from "react";
import {
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  FolderIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";

const initialFiles = [
  { id: "logo", name: "logo-primary.svg", meta: "24 KB", kind: "image" },
  { id: "moodboard", name: "moodboard-v3.png", meta: "3.2 MB", kind: "image" },
  { id: "guidelines", name: "brand-guidelines.pdf", meta: "11 MB", kind: "doc" },
  { id: "hero", name: "hero-shoot-04.jpg", meta: "5.6 MB", kind: "image" },
  { id: "copy", name: "tagline-options.md", meta: "6 KB", kind: "doc" },
  { id: "palette", name: "palette-export.png", meta: "180 KB", kind: "image" },
];

export default function Attachment14() {
  const [files, setFiles] = React.useState(initialFiles);
  const [selected, setSelected] = React.useState<string[]>(["moodboard"]);
  const [downloaded, setDownloaded] = React.useState(false);

  React.useEffect(() => {
    if (!downloaded) return;
    const timeout = window.setTimeout(() => setDownloaded(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [downloaded]);

  function toggle(id: string, checked: boolean) {
    setDownloaded(false);
    setSelected((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    );
  }

  function deleteSelected() {
    setFiles((current) => current.filter((file) => !selected.includes(file.id)));
    setSelected([]);
  }

  return (
    <section
      aria-label="Brand refresh 2026 folder"
      className="w-full max-w-lg rounded-2xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex min-h-8 items-center justify-between gap-3">
        {selected.length > 0 ? (
          <>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear selection"
                onClick={() => setSelected([])}
              >
                <XIcon aria-hidden="true" />
              </Button>
              <p className="text-sm font-medium tabular-nums" aria-live="polite">
                {selected.length} selected
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDownloaded(true)}
              >
                {downloaded ? (
                  <CheckIcon aria-hidden="true" />
                ) : (
                  <DownloadIcon aria-hidden="true" />
                )}
                <span className="max-sm:sr-only">
                  {downloaded ? "Downloaded" : "Download"}
                </span>
              </Button>
              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                <Trash2Icon aria-hidden="true" />
                <span className="max-sm:sr-only">Delete</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="flex min-w-0 items-center gap-2 text-sm font-medium">
              <FolderIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              <span className="truncate">Brand refresh 2026</span>
            </h3>
            <span className="text-xs text-muted-foreground tabular-nums">
              {files.length} files
            </span>
          </>
        )}
      </div>
      {files.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((file) => {
            const isSelected = selected.includes(file.id);
            return (
              <li key={file.id}>
                <Attachment
                  orientation="vertical"
                  data-selected={isSelected || undefined}
                  className="w-full has-data-[slot=attachment-content]:w-full data-selected:border-primary data-selected:bg-accent/40"
                >
                  <AttachmentMedia
                    variant={file.kind === "image" ? "image" : "icon"}
                  >
                    {file.kind === "image" ? (
                      <img src="/placeholder.svg" alt="" />
                    ) : (
                      <FileTextIcon aria-hidden="true" />
                    )}
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{file.name}</AttachmentTitle>
                    <AttachmentDescription>{file.meta}</AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => toggle(file.id, checked)}
                      aria-label={`Select ${file.name}`}
                      className="bg-background shadow-xs dark:bg-background"
                    />
                  </AttachmentActions>
                  {/* Pointer shortcut: clicking the tile toggles it. The
                      checkbox stays the single keyboard and screen reader
                      control, so the trigger is hidden from both. */}
                  <AttachmentTrigger
                    tabIndex={-1}
                    aria-hidden="true"
                    className="rounded-2xl"
                    onClick={() => toggle(file.id, !isSelected)}
                  />
                </Attachment>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          This folder is empty.{" "}
          <button
            type="button"
            className="font-medium text-foreground underline underline-offset-4"
            onClick={() => setFiles(initialFiles)}
          >
            Restore deleted files
          </button>
        </p>
      )}
    </section>
  );
}
