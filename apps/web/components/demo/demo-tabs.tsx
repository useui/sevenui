"use client";

import * as React from "react";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

const TAB_CLASSES =
  "rounded-md px-2.5 py-1 text-muted-foreground aria-selected:bg-muted aria-selected:text-foreground";

/**
 * The Preview/Code toggle around a `<Component>`'s two server-rendered
 * panes (task-2.6 brief step 6). Both panes are rendered up front by the
 * server (`preview`/`code` props, already-highlighted markup) — this
 * component's only job is toggling `aria-selected` (the tab buttons) and
 * `hidden` (the two panes), the same two attributes
 * `legacy-components/example-card.astro`'s single delegated click listener
 * toggled for the 10 live gallery pages. Structure (`mt-3 overflow-hidden
 * rounded-xl border` wrapping both panes) is copied from that same file.
 *
 * No height estimate, no postMessage protocol, no `ResizeObserver`, no
 * `rafThrottle` listener (§7.3/§14.7 retired all of that with the iframe):
 * each pane is real DOM at its real height the moment it paints, so
 * switching tabs can change the page's height — §17.6 #8's recorded,
 * expected consequence, not a regression to chase.
 */
export function DemoTabs({ code, preview }: { code: React.ReactNode; preview: React.ReactNode }) {
  const [tab, setTab] = React.useState<"code" | "preview">("preview");

  return (
    <div className="my-6">
      <div className="flex items-center justify-end">
        <div className="flex rounded-lg border border-border p-0.5 text-sm" role="tablist">
          <button
            aria-selected={tab === "preview"}
            className={cx(TAB_CLASSES)}
            onClick={() => setTab("preview")}
            role="tab"
            type="button"
          >
            Preview
          </button>
          <button
            aria-selected={tab === "code"}
            className={cx(TAB_CLASSES)}
            onClick={() => setTab("code")}
            role="tab"
            type="button"
          >
            Code
          </button>
        </div>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-border">
        <div hidden={tab !== "preview"}>{preview}</div>
        <div hidden={tab !== "code"}>{code}</div>
      </div>
    </div>
  );
}
