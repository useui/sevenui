"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/registry/base/ui/button";
import { cx } from "../../lib/cx";

const RESET_MS = 1800;

export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // No async clipboard (insecure origin, permissions); execCommand still copies there.
  }
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.append(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Copies `value` and announces the result. `label` names what is copied, e.g. "license key". */
export function CopyButton({
  value,
  label,
  showText = false,
  text: idleText = "Copy",
  variant = "ghost",
  className,
}: {
  value: string;
  label: string;
  showText?: boolean;
  /** Visible idle text when `showText` is on. */
  text?: string;
  variant?: "ghost" | "outline" | "default";
  className?: string;
}) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(event: React.MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    window.clearTimeout(timer.current);
    const ok = await writeClipboard(value);
    if (button.isConnected) button.focus({ preventScroll: true });
    setState(ok ? "copied" : "failed");
    timer.current = window.setTimeout(() => setState("idle"), RESET_MS);
  }

  const text = state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : idleText;

  return (
    <>
      <Button
        aria-label={showText ? undefined : `Copy ${label}`}
        className={cx(showText ? "" : "size-8 px-0", className)}
        onClick={copy}
        size={showText ? "default" : "icon"}
        type="button"
        variant={variant}
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
        {showText ? <span className="min-w-[3.25rem] text-left">{text}</span> : null}
      </Button>
      <span aria-live="polite" className="sr-only" role="status">
        {state === "copied" ? `Copied ${label}` : state === "failed" ? `Could not copy the ${label}` : ""}
      </span>
    </>
  );
}
