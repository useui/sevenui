"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronRightIcon, PencilIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

const folders = ["Documents", "Research"];

const siblingNames = ["q3-board-update.pdf", "hiring-plan-2027.xlsx"];

function validate(name: string) {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "Enter a file name.";
  if (/[\\/:*?"<>|]/.test(trimmed)) {
    return 'Remove these characters: \\ / : * ? " < > |';
  }
  if (siblingNames.includes(trimmed)) {
    return "A file with this name already exists in this folder.";
  }
  return null;
}

export default function Popover03() {
  const [open, setOpen] = React.useState(false);
  const [fileName, setFileName] = React.useState("pricing-research.pdf");
  const [draft, setDraft] = React.useState(fileName);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      // Start every edit from the saved name with no stale error.
      setDraft(fileName);
      setError(null);
    }
    setOpen(nextOpen);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validate(draft);
    setError(nextError);
    if (nextError) {
      inputRef.current?.focus();
      return;
    }
    setFileName(draft.trim());
    setOpen(false);
  }

  return (
    <nav aria-label="Breadcrumb" className="w-full max-w-md">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
        {folders.map((folder, index) => (
          <li
            key={folder}
            className={cn(
              "flex shrink-0 items-center gap-1.5",
              // Collapse all but the parent folder below sm.
              index < folders.length - 1 && "hidden sm:flex",
            )}
          >
            <a
              href={`#${folder.toLowerCase()}`}
              className="rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {folder}
            </a>
            <ChevronRightIcon className="size-3.5" aria-hidden="true" />
          </li>
        ))}
        <li className="flex min-w-0 items-center" aria-current="page">
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Rename ${fileName}`}
                  className="min-w-0 shrink font-medium text-foreground"
                />
              }
            >
              <span className="truncate">{fileName}</span>
              <PencilIcon aria-hidden="true" className="text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="start" initialFocus={inputRef} className="w-72 max-w-[calc(100vw-2rem)]">
              <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
                <PopoverHeader>
                  <PopoverTitle>Rename file</PopoverTitle>
                </PopoverHeader>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="popover-03-name">File name</Label>
                  <Input
                    ref={inputRef}
                    id="popover-03-name"
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "popover-03-error" : undefined}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {error ? (
                    <p id="popover-03-error" role="alert" className="text-xs text-destructive">
                      {error}
                    </p>
                  ) : null}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Rename
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </li>
      </ol>
    </nav>
  );
}
