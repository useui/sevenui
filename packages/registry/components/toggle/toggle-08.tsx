"use client";

import { CheckIcon, LockIcon, PaperclipIcon, SendIcon, XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import { Textarea } from "@/registry/base/ui/textarea";
import { Toggle } from "@/registry/base/ui/toggle";

export default function Toggle08() {
  const [internal, setInternal] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [file, setFile] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("");
  const fileInput = React.useRef<HTMLInputElement>(null);
  const id = React.useId();

  function send() {
    if (!draft.trim()) return;
    setStatus(internal ? "Note added for teammates." : "Reply sent to Maya.");
    setDraft("");
    setFile(null);
  }

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl border text-card-foreground shadow-sm transition-colors",
        internal ? "border-warning/60 bg-warning/5" : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b px-3 py-2",
          internal ? "border-warning/60" : "border-border",
        )}
      >
        <label htmlFor={id} className="truncate text-sm font-medium">
          {internal ? "Internal note" : "Reply to Maya Chen"}
        </label>
        <Toggle
          size="sm"
          variant="outline"
          pressed={internal}
          onPressedChange={setInternal}
          className="aria-pressed:border-warning/60 aria-pressed:bg-warning/15"
        >
          <LockIcon aria-hidden="true" />
          Internal
        </Toggle>
      </div>
      <Textarea
        id={id}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setStatus("");
        }}
        placeholder={
          internal
            ? "Only teammates on this ticket will see this note."
            : "Write a reply. Maya will get it by email."
        }
        className="min-h-24 resize-none rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <div className="flex items-center gap-2 px-3 py-2">
        <input
          ref={fileInput}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            setFile(event.target.files?.[0]?.name ?? null);
            event.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Attach file"
          onClick={() => fileInput.current?.click()}
        >
          <PaperclipIcon aria-hidden="true" />
        </Button>
        <div aria-live="polite" className="flex min-w-0 flex-1 items-center">
          {file ? (
            <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-muted py-0.5 pr-0.5 pl-2 text-xs">
              <span className="truncate">{file}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${file}`}
                onClick={() => setFile(null)}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </span>
          ) : status ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <CheckIcon aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{status}</span>
            </span>
          ) : null}
        </div>
        <Button
          size="sm"
          variant={internal ? "outline" : "default"}
          disabled={!draft.trim()}
          onClick={send}
        >
          <SendIcon aria-hidden="true" data-icon="inline-start" />
          {internal ? "Add note" : "Send reply"}
        </Button>
      </div>
    </div>
  );
}
