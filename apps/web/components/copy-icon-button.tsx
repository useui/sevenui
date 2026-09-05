"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

/** Icon-only variant of CopyCommand for compact toolbars: copies the
 * command on click and briefly swaps to a check mark as feedback. The
 * surrounding markup (an Astro-side tooltip wrapper) carries the visible
 * command text; this button only needs to name its action. */
export default function CopyIconButton({ command }: { command: string }) {
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
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy install command"}
      className="peer inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {copied ? (
        <CheckIcon className="size-4" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <CopyIcon className="size-4" strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}
