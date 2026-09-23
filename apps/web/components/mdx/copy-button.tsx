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
};

export function CopyButton({ getText, className }: CopyButtonProps) {
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
        "absolute top-2 right-3 z-[2] inline-flex size-[1.875rem] select-none items-center justify-center rounded-md bg-background text-muted-foreground transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-muted hover:text-foreground",
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
