"use client";

import * as React from "react";
import {
  FileArchiveIcon,
  FileAudioIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";

type PickedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  tooLarge: boolean;
};

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 5;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(type: string, name: string) {
  if (type.startsWith("image/")) return FileImageIcon;
  if (type.startsWith("video/")) return FileVideoIcon;
  if (type.startsWith("audio/")) return FileAudioIcon;
  if (/\.(zip|tar|gz|rar|7z)$/i.test(name)) return FileArchiveIcon;
  if (type.startsWith("text/") || type === "application/pdf") {
    return FileTextIcon;
  }
  return FileIcon;
}

export default function Attachment07() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<PickedFile[]>([]);
  const [dragging, setDragging] = React.useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
      tooLarge: file.size > MAX_BYTES,
    }));
    setFiles((current) => {
      const known = new Set(current.map((file) => file.id));
      const fresh = picked.filter((file) => !known.has(file.id));
      return [...current, ...fresh].slice(0, MAX_FILES);
    });
  }

  function remove(id: string) {
    setFiles((current) => current.filter((file) => file.id !== id));
  }

  const full = files.length >= MAX_FILES;
  const rejected = files.filter((file) => file.tooLarge).length;

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
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
      <Attachment
        state="idle"
        orientation="vertical"
        data-dragging={dragging || undefined}
        className={cn(
          "w-full hover:bg-muted/50 has-data-[slot=attachment-content]:w-full data-dragging:border-primary data-dragging:bg-primary/5",
          full && "opacity-60",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!full) addFiles(event.dataTransfer.files);
        }}
      >
        <AttachmentMedia className="aspect-auto h-14 bg-transparent text-muted-foreground">
          <UploadIcon aria-hidden="true" />
        </AttachmentMedia>
        <AttachmentContent className="pb-2 text-center">
          <AttachmentTitle>
            {full ? "File limit reached" : "Drop files or click to browse"}
          </AttachmentTitle>
          <AttachmentDescription>
            Up to {MAX_FILES} files, {formatBytes(MAX_BYTES)} each
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentTrigger
          aria-label="Choose files to attach"
          disabled={full}
          className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={() => inputRef.current?.click()}
        />
      </Attachment>
      {files.length > 0 ? (
        <ul aria-label="Selected files" className="flex flex-col gap-2">
          {files.map((file) => {
            const Icon = iconFor(file.type, file.name);
            return (
              <li key={file.id}>
                <Attachment
                  size="sm"
                  state={file.tooLarge ? "error" : "done"}
                  className="w-full"
                >
                  <AttachmentMedia>
                    <Icon aria-hidden="true" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{file.name}</AttachmentTitle>
                    <AttachmentDescription className="tabular-nums">
                      {file.tooLarge
                        ? `${formatBytes(file.size)} · Over the ${formatBytes(MAX_BYTES)} limit`
                        : formatBytes(file.size)}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction
                      aria-label={`Remove ${file.name}`}
                      onClick={() => remove(file.id)}
                    >
                      <XIcon aria-hidden="true" />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {files.length === 0
          ? "Nothing selected yet. Files stay on your device."
          : rejected > 0
            ? `${rejected} ${rejected === 1 ? "file is" : "files are"} too large and will be skipped.`
            : `${files.length} of ${MAX_FILES} files ready to attach.`}
      </p>
    </div>
  );
}
