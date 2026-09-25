"use client";

import { CircleAlert, FileText, RefreshCw, Trash2, Upload } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";

const maxBytes = 10 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Button15() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<{ name: string; size: number } | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    if (picked.size > maxBytes) {
      setError(`${picked.name} is ${formatBytes(picked.size)}. The limit is 10 MB.`);
      return;
    }
    setError(null);
    setFile({ name: picked.name, size: picked.size });
  }

  function remove() {
    setFile(null);
    setError(null);
    // The row with the focused button disappears, so return focus to the picker.
    requestAnimationFrame(() => document.getElementById("button-15-choose")?.focus());
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 id="button-15-label" className="text-sm font-medium">
          Proof of address
        </h3>
        <p id="button-15-help" className="text-sm text-muted-foreground">
          A utility bill or bank statement from the last 3 months. PDF, PNG or
          JPG, up to 10 MB.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={handleChange}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border bg-card py-2 pr-2 pl-3 text-card-foreground">
          <FileText aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatBytes(file.size)} · Ready to submit
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Replace ${file.name}`}
            onClick={openPicker}
          >
            <RefreshCw aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${file.name}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={remove}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <Button
          id="button-15-choose"
          variant="outline"
          className="w-fit"
          aria-labelledby="button-15-choose-text button-15-label"
          aria-describedby={error ? "button-15-error" : "button-15-help"}
          aria-invalid={error ? true : undefined}
          onClick={openPicker}
        >
          <Upload data-icon="inline-start" aria-hidden="true" />
          <span id="button-15-choose-text">Choose file</span>
        </Button>
      )}

      {error && (
        <p
          id="button-15-error"
          role="alert"
          className="flex items-start gap-1.5 text-sm text-destructive"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0 break-words">{error}</span>
        </p>
      )}
    </div>
  );
}
