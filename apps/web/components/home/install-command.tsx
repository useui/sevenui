"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { currentPackageManager, PACKAGE_MANAGERS, type PackageManager } from "../../lib/package-manager";
import { writeClipboard } from "../pro/copy-button";
import { cx } from "../../lib/cx";

/**
 * The package-manager-aware install command. Unlike the docs' CopyCommand it
 * wraps on narrow screens, so the package name is never cut off.
 */
export function InstallCommand({
  commands,
  label = "install command",
  className,
}: {
  commands: Record<PackageManager, string>;
  label?: string;
  className?: string;
}) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    window.clearTimeout(timer.current);
    const ok = await writeClipboard(commands[currentPackageManager()]);
    setState(ok ? "copied" : "failed");
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <div
      className={cx(
        "flex w-full items-start gap-3 rounded-lg border border-border bg-card py-2 pr-2 pl-4 font-mono text-sm text-card-foreground shadow-xs",
        className,
      )}
    >
      <span aria-hidden="true" className="py-1 text-muted-foreground select-none">
        $
      </span>
      {PACKAGE_MANAGERS.map((pm) => (
        <code
          className={`pm-only pm-only-${pm} min-w-0 flex-1 py-1 text-left leading-5 break-words sm:truncate`}
          key={pm}
        >
          {commands[pm]}
        </code>
      ))}
      <button
        aria-label={`Copy ${label}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
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
