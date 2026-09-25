"use client";

import * as React from "react";
import { usePresetScope } from "../preset-scope";
import { PRESET_SCOPE_ATTR } from "../preset-scope-attr";

export function PreviewPane({
  children,
  contain = false,
  compact = false,
}: {
  children: React.ReactNode;
  contain?: boolean;
  /** The gallery stacks many previews; a shorter floor keeps small ones (badge, kbd) from floating in space. */
  compact?: boolean;
}) {
  usePresetScope();
  return (
    <div
      className={`flex items-center justify-center bg-background p-6 ${compact ? "min-h-48 sm:p-8" : "min-h-72 sm:p-10"}`}
      {...{ [PRESET_SCOPE_ATTR]: "" }}
    >
      <div data-sevenui-example="" style={contain ? { contain: "layout paint" } : undefined}>
        {children}
      </div>
    </div>
  );
}
