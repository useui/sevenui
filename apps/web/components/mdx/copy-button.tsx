"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

// One shared live region per PAGE, not one per code block (§ task-2.4 review
// criteria). Every <CopyButton> instance announces through this single
// singleton element instead of rendering its own `role="status"` node — a
// docs page can carry dozens of fences, and duplicating the region would
// mean duplicate/racing announcements and needless DOM. Created eagerly on
// first mount (not lazily inside the click handler) so it already exists in
// the accessibility tree before the first copy — some screen readers miss a
// live region's very first update if the region and its content both
// appear in the same tick.
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
  /** Read lazily, at click time — the associated <code>'s live textContent,
   *  not a string frozen at render time (so it stays correct even if
   *  CodeBlock's child was cloned/rendered by a different producer). */
  getText: () => string;
  className?: string;
};

// Reproduces the measured code-block copy button (measured-label-mechanism
// .json / measured-codeblock-chrome.json): NOT hover-revealed — opacity is
// 1 at rest, `bg-background`, `z-[2]` so it sits above CodeBlock's language
// header band. 30px chip (`size-[1.875rem]`) at `top-2 right-3`, radius
// `rounded-md`. Icon swap is lucide copy -> check via a `scale-0` transform
// (both icons always mounted so the swap animates instead of popping): the
// check sits in normal flow at `scale-0` by default and turns green when
// revealed; the copy icon is the one absolutely stacked on top of it,
// visible by default and swapping to `scale-0` on copy. A 1500ms hold
// restarts on every repeat click, there is no flash on clipboard failure,
// and the aria-label swaps. `copy-command.tsx` is a different component for
// a different surface (a `$ command` row on the landing page/gallery cards)
// and does not cover this.
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
      // Clipboard unavailable (permissions/insecure context): nothing to
      // undo, and deliberately no flash/announcement on failure.
      return;
    }

    // Restart the hold on a repeat click rather than letting an earlier
    // timeout fire mid-hold and revert the state early.
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
