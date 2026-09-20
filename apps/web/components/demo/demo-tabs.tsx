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
 * Task 4.2 gives it a SECOND consumer, the `/components` gallery's example
 * card — which is where the tablist markup, `TAB_CLASSES` and the panel
 * wrapper below were copied FROM in the first place. Two optional props
 * carry the whole difference: `heading` (the anchored `<h2>` the gallery
 * puts at the leading edge of the header row) and `className` (the gallery
 * supplies its own outer element, so it wants none of the default vertical
 * margin). Both default to today's behaviour, so all 137 docs demos render
 * byte-identically — asserted against a captured pre-change build in
 * task-4.2-report.md, not assumed.
 *
 * No height estimate, no postMessage protocol, no `ResizeObserver`, no
 * `rafThrottle` listener (§7.3/§14.7 retired all of that with the iframe):
 * each pane is real DOM at its real height the moment it paints, so
 * switching tabs can change the page's height — §17.6 #8's recorded,
 * expected consequence, not a regression to chase.
 */
export function DemoTabs({
  code,
  preview,
  heading,
  className = "my-6",
}: {
  code: React.ReactNode;
  preview: React.ReactNode;
  heading?: React.ReactNode;
  className?: string;
}) {
  const [tab, setTab] = React.useState<"code" | "preview">("preview");

  return (
    // `|| undefined` rather than passing the empty string straight through:
    // the gallery card supplies its own outer `<section>` (it also has to
    // hold the install-command row, which is not part of the toggle), so it
    // wants no wrapper utilities at all here, and React renders an empty
    // string as a literal empty class attribute.
    <div className={className || undefined}>
      {/*
        Two header shapes, one row. With no heading the tab strip is pushed
        to the trailing edge on its own (the docs demos); with a heading the
        row becomes a space-between pair with a gap (the gallery's example
        cards). Both class lists are ported verbatim — the first from this
        component's own Task 2.6 output, the second from
        `legacy-components/example-card.astro`.

        `!== undefined`, not truthiness: `heading` is a `ReactNode`, and a
        caller passing a valid-but-falsy one (`""`, `0`) means "there is a
        heading" while reading as false. The docs demos pass nothing at all,
        which is the only case that may take the trailing-edge layout.
      */}
      <div
        className={
          heading !== undefined ? "flex items-center justify-between gap-4" : "flex items-center justify-end"
        }
      >
        {heading}
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
