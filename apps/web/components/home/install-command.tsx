"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { currentFlavour } from "../../lib/flavour";
import { currentPackageManager, PACKAGE_MANAGERS, type PackageManager } from "../../lib/package-manager";
import { writeClipboard } from "../pro/copy-button";
import { cx } from "../../lib/cx";

/**
 * The package-manager-aware install command. Unlike the docs' CopyCommand it
 * wraps on narrow screens, so the package name is never cut off. With
 * `uiSdkCommands` it also follows the site-wide flavour: both variants are
 * server-rendered and CSS shows the reader's (`.flavour-only-*`).
 */
export function InstallCommand({
  commands,
  uiSdkCommands,
  label = "install command",
  wrap = false,
  className,
}: {
  commands: Record<PackageManager, string>;
  /** The UI SDK flavour's commands, for an item that has one. */
  uiSdkCommands?: Record<PackageManager, string>;
  label?: string;
  /** Wrap long commands at every width instead of truncating from sm up. */
  wrap?: boolean;
  className?: string;
}) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    window.clearTimeout(timer.current);
    const set = uiSdkCommands && currentFlavour() === "ui-sdk" ? uiSdkCommands : commands;
    const ok = await writeClipboard(set[currentPackageManager()]);
    setState(ok ? "copied" : "failed");
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }

  const variants: { flavour?: "base-ui" | "ui-sdk"; set: Record<PackageManager, string> }[] = uiSdkCommands
    ? [
        { flavour: "base-ui", set: commands },
        { flavour: "ui-sdk", set: uiSdkCommands },
      ]
    : [{ set: commands }];

  return (
    <div
      className={cx(
        // The D command box: an inset field, not a card. Hairline edge, inset shadow, mono text.
        "flex min-h-10 w-full items-start gap-3 rounded-[10px] border border-hairline-strong bg-surface-inset py-1.5 pr-1.5 pl-3.5 font-mono text-[0.8125rem] text-foreground shadow-inset",
        className,
      )}
    >
      <span aria-hidden="true" className="py-1 leading-5 text-muted-foreground/70 select-none">
        $
      </span>
      {variants.map(({ flavour, set }) =>
        PACKAGE_MANAGERS.map((pm) => (
          <code
            className={cx(
              `pm-only pm-only-${pm} min-w-0 flex-1 py-1 text-left leading-5 break-words`,
              flavour && `flavour-only-${flavour}`,
              !wrap && "sm:truncate",
            )}
            key={`${flavour}-${pm}`}
          >
            {set[pm]}
          </code>
        )),
      )}
      <button
        aria-label={`Copy ${label}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline)] hover:bg-surface-panel hover:text-foreground focus-visible:focus-ring"
        onClick={copy}
        type="button"
      >
        <span className="relative grid size-4 place-items-center">
          <CopyIcon
            aria-hidden
            className={cx("sv-swap col-start-1 row-start-1 size-4", state === "copied" && "scale-50 opacity-0 blur-[2px]")}
          />
          <CheckIcon
            aria-hidden
            className={cx(
              "sv-swap col-start-1 row-start-1 size-4 text-success",
              state !== "copied" && "scale-50 opacity-0 blur-[2px]",
            )}
          />
        </span>
      </button>
      <span aria-live="polite" className="sr-only" role="status">
        {state === "copied" ? `Copied ${label}` : state === "failed" ? `Could not copy the ${label}` : ""}
      </span>
    </div>
  );
}
