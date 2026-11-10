"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

const LIVE_REGION_ID = "codeblock-copy-status";

function ensureLiveRegion(): HTMLElement {
  let el = document.getElementById(LIVE_REGION_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = LIVE_REGION_ID;
    el.setAttribute("role", "status");
    el.className = "sr-only";
    document.body.appendChild(el);
  }
  return el;
}

export type CopyButtonProps = {
  getText: () => string;
  className?: string;
  /** "float" pins it over the code's top-right corner; "inline" lets a header row place it. */
  placement?: "float" | "inline";
};

export function CopyButton({ getText, className, placement = "float" }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    ensureLiveRegion();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(getText());
    } catch {
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCopied(true);
    ensureLiveRegion().textContent = "Copied to clipboard";
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? "Copied" : "Copy code"}
      className={cx(
        "inline-flex size-[1.875rem] shrink-0 select-none items-center justify-center rounded-md text-muted-foreground transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:text-foreground",
        placement === "float"
          ? "absolute top-2 right-3 z-[2] bg-background hover:bg-muted"
          : // On a LayerCard tray the hover lifts the button to the panel surface, like the selected tab.
            "hover:bg-(--layer-card-panel-bg,var(--muted))",
        className,
      )}
    >
      <span className="relative flex size-3.5 items-center justify-center">
        <CheckIcon
          aria-hidden="true"
          className={cx(
            "size-3.5 scale-0 text-green-600 transition-transform duration-150 dark:text-green-500",
            copied && "scale-100",
          )}
        />
        <CopyIcon
          aria-hidden="true"
          className={cx("absolute size-3.5 transition-transform duration-150", copied && "scale-0")}
        />
      </span>
    </button>
  );
}
