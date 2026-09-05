"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

/** A one-line shell command with a copy button and brief "copied" feedback. */
export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions/insecure context); nothing to undo.
    }
  };

  return (
    <div className="flex w-full items-center gap-3 rounded-lg border bg-card py-2 pr-2 pl-4 font-mono text-sm text-card-foreground shadow-xs">
      <span aria-hidden="true" className="text-muted-foreground select-none">
        $
      </span>
      <code className="flex-1 truncate text-left">{command}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {copied ? (
          <CheckIcon className="size-4" />
        ) : (
          <CopyIcon className="size-4" />
        )}
      </button>
    </div>
  );
}
