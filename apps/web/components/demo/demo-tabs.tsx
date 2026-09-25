"use client";

import * as React from "react";

const TABS = [
  { value: "preview", label: "Preview" },
  { value: "code", label: "Code" },
] as const;

type Tab = (typeof TABS)[number]["value"];

const TAB_CLASSES =
  "rounded-md px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground aria-selected:bg-muted aria-selected:text-foreground";

export function DemoTabs({
  code,
  preview,
  heading,
  actions,
  label = "Example view",
  className,
}: {
  code: React.ReactNode;
  preview: React.ReactNode;
  heading?: React.ReactNode;
  /** When set, the tabs move into a toolbar above the preview with these controls on its right. */
  actions?: React.ReactNode;
  /** Accessible name for the tablist; the gallery passes the example title. */
  label?: string;
  className?: string;
}) {
  const [tab, setTab] = React.useState<Tab>("preview");
  const id = React.useId();
  const tabRefs = React.useRef<Record<Tab, HTMLButtonElement | null>>({ preview: null, code: null });

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const at = TABS.findIndex((entry) => entry.value === tab);
    let next: number;
    if (event.key === "ArrowRight") next = (at + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (at - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    const value = TABS[next].value;
    setTab(value);
    tabRefs.current[value]?.focus();
  };

  const tablist = (
    <div
      aria-label={label}
      className="flex shrink-0 rounded-lg border border-border p-0.5 text-sm"
      onKeyDown={onKeyDown}
      role="tablist"
    >
      {TABS.map((entry) => (
        <button
          aria-controls={`${id}-${entry.value}`}
          aria-selected={tab === entry.value}
          className={TAB_CLASSES}
          id={`${id}-${entry.value}-tab`}
          key={entry.value}
          onClick={() => setTab(entry.value)}
          ref={(node) => {
            tabRefs.current[entry.value] = node;
          }}
          role="tab"
          tabIndex={tab === entry.value ? 0 : -1}
          type="button"
        >
          {entry.label}
        </button>
      ))}
    </div>
  );

  const panels = (
    <>
      <div aria-labelledby={`${id}-preview-tab`} hidden={tab !== "preview"} id={`${id}-preview`} role="tabpanel">
        {preview}
      </div>
      <div aria-labelledby={`${id}-code-tab`} hidden={tab !== "code"} id={`${id}-code`} role="tabpanel">
        {code}
      </div>
    </>
  );

  if (actions !== undefined) {
    return (
      <div className={className}>
        {heading}
        {/* No overflow-hidden on the frame: the install menu drops out of the toolbar. */}
        <div className="mt-3 rounded-xl border border-border">
          <div className="@container/toolbar flex h-12 items-center gap-2 rounded-t-[calc(var(--radius-xl)_-_1px)] border-b border-border bg-muted/30 px-2">
            {tablist}
            <div className="ml-auto flex min-w-0 items-center gap-1">{actions}</div>
          </div>
          <div className="overflow-hidden rounded-b-[calc(var(--radius-xl)_-_1px)]">{panels}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={
          heading !== undefined
            ? "flex flex-wrap items-end justify-between gap-x-4 gap-y-3"
            : "flex items-center justify-end"
        }
      >
        {heading}
        {tablist}
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-border">{panels}</div>
    </div>
  );
}
