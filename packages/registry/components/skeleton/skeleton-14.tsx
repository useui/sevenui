"use client";

import { FileText, Film, ImageIcon, Upload } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";

type Kind = "image" | "video" | "doc";

type FileItem = {
  id: string;
  name: string;
  kind: Kind;
  meta: string;
  processing: boolean;
};

const existing: FileItem[] = [
  {
    id: "f1",
    name: "moodboard-v3.png",
    kind: "image",
    meta: "2.4 MB · 2400×1600",
    processing: false,
  },
  {
    id: "f2",
    name: "brand-guidelines.pdf",
    kind: "doc",
    meta: "8.1 MB · 42 pages",
    processing: false,
  },
];

// The next batch a user drops in: names are known instantly, previews are not.
const batch: Omit<FileItem, "id" | "processing">[] = [
  { name: "launch-teaser.mp4", kind: "video", meta: "36.2 MB · 0:48" },
  { name: "hero-desktop.jpg", kind: "image", meta: "1.9 MB · 2880×1620" },
  { name: "press-kit.pdf", kind: "doc", meta: "4.7 MB · 12 pages" },
];

const icons = { image: ImageIcon, video: Film, doc: FileText };

export default function Skeleton14() {
  const [files, setFiles] = React.useState(existing);
  const [uploads, setUploads] = React.useState(0);

  const nextPending = files.find((file) => file.processing)?.id;
  const processingCount = files.filter((file) => file.processing).length;

  // Previews finish one at a time, like a real thumbnail worker queue.
  React.useEffect(() => {
    if (!nextPending) return;
    const timer = window.setTimeout(() => {
      setFiles((current) =>
        current.map((file) =>
          file.id === nextPending ? { ...file, processing: false } : file,
        ),
      );
    }, 900);
    return () => window.clearTimeout(timer);
  }, [nextPending]);

  function addBatch() {
    const round = uploads + 1;
    setUploads(round);
    setFiles((current) => [
      ...batch.map((file, index) => ({
        ...file,
        id: `u${round}-${index}`,
        processing: true,
      })),
      ...current,
    ]);
  }

  return (
    <section
      aria-label="Campaign assets"
      className="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Spring campaign</h3>
          <p className="text-sm text-muted-foreground tabular-nums">
            {files.length} files
          </p>
        </div>
        <Button
          variant="outline"
          onClick={addBatch}
          disabled={processingCount > 0}
          focusableWhenDisabled
        >
          <Upload aria-hidden="true" />
          Upload 3 files
        </Button>
      </div>

      <p role="status" className="sr-only">
        {processingCount > 0
          ? `Generating previews, ${processingCount} remaining`
          : uploads > 0
            ? "All previews ready"
            : ""}
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {files.map((file) => {
          const Icon = icons[file.kind];
          return (
            <li
              key={file.id}
              aria-busy={file.processing}
              className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-background"
            >
              {file.processing ? (
                <Skeleton
                  aria-hidden="true"
                  className="aspect-[4/3] w-full rounded-none"
                />
              ) : file.kind === "doc" ? (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted">
                  <FileText
                    aria-hidden="true"
                    className="size-8 text-muted-foreground"
                  />
                </div>
              ) : (
                <img
                  src="/placeholder.svg"
                  alt=""
                  className="aspect-[4/3] w-full bg-muted object-cover"
                />
              )}
              <div className="flex min-w-0 flex-col gap-1 p-2.5">
                <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                  <Icon
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
                  <span className="truncate">{file.name}</span>
                </p>
                {file.processing ? (
                  <>
                    <Skeleton aria-hidden="true" className="my-0.5 h-3 w-3/4" />
                    <span className="sr-only">Generating preview</span>
                  </>
                ) : (
                  <p className="truncate text-xs text-muted-foreground tabular-nums">
                    {file.meta}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
