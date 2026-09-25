"use client";

import { useId, useState } from "react";
import {
  CheckIcon,
  FileTextIcon,
  ImageIcon,
  PencilIcon,
  SheetIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";

type FileEntry = {
  id: string;
  base: string;
  ext: string;
  size: string;
  edited: string;
};

const initialFiles: FileEntry[] = [
  { id: "f1", base: "Q3 board deck", ext: "pdf", size: "4.2 MB", edited: "2h ago" },
  { id: "f2", base: "hiring-plan-2027", ext: "xlsx", size: "86 KB", edited: "Yesterday" },
  { id: "f3", base: "office-floorplan", ext: "png", size: "1.1 MB", edited: "Sep 18" },
];

const icons: Record<string, typeof FileTextIcon> = {
  pdf: FileTextIcon,
  xlsx: SheetIcon,
  png: ImageIcon,
};

const ILLEGAL = /[\\/:*?"<>|]/;

export default function InputGroup14() {
  const inputId = useId();
  const errorId = useId();
  const [files, setFiles] = useState(initialFiles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Saving or cancelling unmounts the field, so send focus back to the row's
  // rename button instead of dropping it on the page.
  function stopEditing(file: FileEntry) {
    setEditingId(null);
    setError(null);
    requestAnimationFrame(() =>
      document.getElementById(`${inputId}-rename-${file.id}`)?.focus(),
    );
  }

  function startEditing(file: FileEntry) {
    setEditingId(file.id);
    setDraft(file.base);
    setError(null);
  }

  function save(file: FileEntry) {
    const name = draft.trim();
    if (!name) {
      setError("File name can't be empty.");
      return;
    }
    if (ILLEGAL.test(name)) {
      setError('Names can\'t contain \\ / : * ? " < > |');
      return;
    }
    const clash = files.some(
      (other) =>
        other.id !== file.id &&
        other.ext === file.ext &&
        other.base.toLowerCase() === name.toLowerCase(),
    );
    if (clash) {
      setError(`${name}.${file.ext} already exists in this folder.`);
      return;
    }
    setFiles((current) =>
      current.map((item) =>
        item.id === file.id ? { ...item, base: name, edited: "Just now" } : item,
      ),
    );
    stopEditing(file);
  }

  return (
    <div className="w-full max-w-lg rounded-xl border border-border bg-card">
      <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Operations / Planning</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {files.length} files
        </span>
      </div>
      <ul className="divide-y divide-border">
        {files.map((file) => {
          const Icon = icons[file.ext] ?? FileTextIcon;
          const editing = editingId === file.id;
          return (
            <li key={file.id} className="px-4 py-2.5">
              {editing ? (
                <form
                  className="flex flex-col gap-1.5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    save(file);
                  }}
                >
                  <label htmlFor={inputId} className="sr-only">
                    New name for {file.base}.{file.ext}
                  </label>
                  <InputGroup>
                    <InputGroupAddon>
                      <Icon aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id={inputId}
                      value={draft}
                      autoFocus
                      onFocus={(event) => event.currentTarget.select()}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      onChange={(event) => {
                        setDraft(event.target.value);
                        if (error) setError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") stopEditing(file);
                      }}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText className="font-mono text-xs">
                        .{file.ext}
                      </InputGroupText>
                      <InputGroupButton
                        type="submit"
                        size="icon-xs"
                        aria-label="Save name"
                      >
                        <CheckIcon aria-hidden="true" />
                      </InputGroupButton>
                      <InputGroupButton
                        size="icon-xs"
                        aria-label="Cancel rename"
                        onClick={() => stopEditing(file)}
                      >
                        <XIcon aria-hidden="true" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {error ? (
                    <p id={errorId} role="alert" className="text-xs text-destructive">
                      {error}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Enter to save, Esc to cancel. The extension stays{" "}
                      <span className="font-mono">.{file.ext}</span>.
                    </p>
                  )}
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {file.base}
                      <span className="text-muted-foreground">.{file.ext}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.size} · {file.edited}
                    </p>
                  </div>
                  <Button
                    id={`${inputId}-rename-${file.id}`}
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Rename ${file.base}.${file.ext}`}
                    onClick={() => startEditing(file)}
                  >
                    <PencilIcon aria-hidden="true" />
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
