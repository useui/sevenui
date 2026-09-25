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
  label = "Example view",
  className,
}: {
  code: React.ReactNode;
  preview: React.ReactNode;
  heading?: React.ReactNode;
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
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-border">
        <div
          aria-labelledby={`${id}-preview-tab`}
          hidden={tab !== "preview"}
          id={`${id}-preview`}
          role="tabpanel"
        >
          {preview}
        </div>
        <div aria-labelledby={`${id}-code-tab`} hidden={tab !== "code"} id={`${id}-code`} role="tabpanel">
          {code}
        </div>
      </div>
    </div>
  );
}
