"use client";

import * as React from "react";
import { cn } from "cn";
import { FileIcon, FolderPlusIcon, UploadCloudIcon, UploadIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

type StoredFile = { id: number; name: string; size: number };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Empty16() {
  const [files, setFiles] = React.useState<StoredFile[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const nextId = React.useRef(0);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const next = Array.from(list, (file) => ({
      id: nextId.current++,
      name: file.name,
      size: file.size,
    }));
    setFiles((current) => [...current, ...next]);
  }

  return (
    <section
      aria-labelledby="empty-16-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#files">All files</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#brand-refresh">
                  Brand refresh
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage id="empty-16-title">Final exports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <FolderPlusIcon data-icon="inline-start" aria-hidden="true" />
            New folder
          </Button>
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            <UploadIcon data-icon="inline-start" aria-hidden="true" />
            Upload
          </Button>
        </div>
      </header>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <section
        aria-label="Drop files to upload to Final exports"
        className="p-4"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        {files.length === 0 ? (
          <Empty
            className={cn(
              "border-2 py-10 transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <EmptyHeader>
              <EmptyMedia
                className={cn(
                  "size-12 rounded-full bg-muted text-muted-foreground transition-transform",
                  dragging && "-translate-y-1 text-primary",
                )}
              >
                <UploadCloudIcon className="size-6" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>
                {dragging ? "Drop to upload" : "This folder is empty"}
              </EmptyTitle>
              <EmptyDescription>
                Drag logos, mockups, or PDFs here. Files up to 250&nbsp;MB are
                shared with everyone on Brand refresh.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                size="sm"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                Choose files
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ul
            aria-label="Files in Final exports"
            className={cn(
              "flex flex-col divide-y rounded-lg border transition-colors",
              dragging && "border-primary bg-primary/5",
            )}
          >
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 px-3 py-2.5 text-sm"
              >
                <FileIcon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatSize(file.size)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
