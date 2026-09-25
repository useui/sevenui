"use client";

import { Check, Download, FileText, Film, Trash2, X } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";

type FileKind = "image" | "video" | "document";

const initialFiles: { id: string; name: string; size: string; kind: FileKind }[] = [
  { id: "hero", name: "spring-hero.png", size: "2.4 MB", kind: "image" },
  { id: "teaser", name: "launch-teaser.mp4", size: "48.1 MB", kind: "video" },
  { id: "brief", name: "campaign-brief.pdf", size: "860 KB", kind: "document" },
  { id: "banner", name: "email-banner.jpg", size: "1.1 MB", kind: "image" },
  { id: "lookbook", name: "lookbook-cover.png", size: "3.7 MB", kind: "image" },
  { id: "copy", name: "product-copy.pdf", size: "212 KB", kind: "document" },
];

const kindIcon = { video: Film, document: FileText };

export default function AspectRatio11() {
  const [files, setFiles] = React.useState(initialFiles);
  const [selected, setSelected] = React.useState<string[]>(["hero", "banner"]);
  const [downloaded, setDownloaded] = React.useState(false);

  // The download confirmation clears itself after a moment.
  React.useEffect(() => {
    if (!downloaded) return;
    const timer = window.setTimeout(() => setDownloaded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [downloaded]);

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );

  return (
    <section
      aria-label="Spring campaign assets"
      className="w-full max-w-xl rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex min-h-14 items-center justify-between gap-2 border-b px-4 py-2">
        {selected.length > 0 ? (
          <>
            <p className="text-sm font-medium" aria-live="polite">
              {downloaded
                ? `Downloading ${selected.length} ${selected.length === 1 ? "file" : "files"}`
                : `${selected.length} selected`}
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Download selected"
                onClick={() => setDownloaded(true)}
              >
                {downloaded ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Download aria-hidden="true" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete selected"
                onClick={() => {
                  setFiles((current) =>
                    current.filter((file) => !selected.includes(file.id)),
                  );
                  setSelected([]);
                  setDownloaded(false);
                }}
              >
                <Trash2 aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear selection"
                onClick={() => {
                  setSelected([]);
                  setDownloaded(false);
                }}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          </>
        ) : (
          <div>
            <h3 className="text-sm font-medium">
              Spring campaign assets
            </h3>
            <p className="text-xs text-muted-foreground">
              {files.length} files · Shared with Marketing
            </p>
          </div>
        )}
      </div>
      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This folder is empty. Drop files here to upload them.
          </p>
          <Button variant="outline" size="sm" onClick={() => setFiles(initialFiles)}>
            Restore files
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {files.map((file) => {
            const checked = selected.includes(file.id);
            const Icon = file.kind === "image" ? null : kindIcon[file.kind];
            const inputId = `aspect-ratio-11-${file.id}`;
            return (
              <li
                key={file.id}
                data-selected={checked || undefined}
                className="group relative rounded-lg border p-1.5 transition-colors hover:bg-muted/50 data-selected:border-primary data-selected:bg-primary/5"
              >
                <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md bg-muted">
                  {Icon ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon aria-hidden="true" className="size-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src="/placeholder.svg"
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  )}
                  <span className="absolute top-1.5 left-1.5 flex rounded-sm bg-background/90 p-0.5">
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      onCheckedChange={(value) => toggle(file.id, value)}
                    />
                  </span>
                </AspectRatio>
                <label htmlFor={inputId} className="block cursor-pointer px-0.5 pt-1.5">
                  <span className="block truncate text-sm font-medium">{file.name}</span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {file.size}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
