"use client";

import * as React from "react";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

const TAB_CLASSES =
  "rounded-md px-2.5 py-1 text-muted-foreground aria-selected:bg-muted aria-selected:text-foreground";

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
    <div className={className || undefined}>
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
