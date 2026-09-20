"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { PACKAGE_MANAGERS, type PackageManager, currentPackageManager } from "../lib/package-manager";

/**
 * A one-line shell command with a copy button and brief "copied" feedback.
 *
 * Task 4.1 (§13.2, §17.6 #15) makes it follow the site's package-manager
 * preference. The SHAPE is untouched — the same `$ command` row, the same
 * classes — but the single `command: string` becomes the same four-command
 * set `<InstallCommand>` (components/mdx/install-command.tsx) carries, so all
 * three install surfaces now agree on the preference instead of this one
 * reading a hard `npx`.
 *
 * The selection mechanism is CSS, not React: all four commands ship in the
 * HTML, each wrapped in `.pm-only .pm-only-<pm>`, and `[data-pm]` on `<html>`
 * — written pre-paint by `<PackageManagerScript>` (Stage 1) — reveals exactly
 * one (globals.css). Reading the preference in an effect and re-rendering
 * would reintroduce precisely the post-hydration repaint that inline script
 * exists to prevent, and would do it once per instance.
 *
 * The four variants need no `.shiki`-style `display: block` companion rule
 * the way `<InstallCommand>`'s do: they are direct children of a `flex`
 * container, so the revealed one is a flex item and its `display: inline`
 * is blockified by flex layout — which is what lets `flex-1` and `truncate`
 * keep working on it.
 *
 * The copy button reads the LIVE preference at click time
 * (`currentPackageManager()`, i.e. `document.documentElement.dataset.pm`
 * with the same pnpm default the CSS falls back to) rather than any React
 * state: that is the same attribute the CSS keys off, so the button can
 * never copy a command other than the one on screen. Reading
 * `.textContent` instead would concatenate all four — `display: none` does
 * not remove a node's text.
 */
export default function CopyCommand({ commands }: { commands: Record<PackageManager, string> }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(commands[currentPackageManager()]);
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
      {PACKAGE_MANAGERS.map((pm) => (
        <code className={`pm-only pm-only-${pm} flex-1 truncate text-left`} key={pm}>
          {commands[pm]}
        </code>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </button>
    </div>
  );
}
