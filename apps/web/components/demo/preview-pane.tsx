"use client";

import * as React from "react";
import { usePresetScope } from "../preset-scope";
import { PRESET_SCOPE_ATTR } from "../preset-scope-attr";

export function PreviewPane({
  children,
  contain = false,
}: {
  children: React.ReactNode;
  contain?: boolean;
}) {
  usePresetScope();
  return (
    <div
      className="flex min-h-72 items-center justify-center bg-background p-6 sm:p-10"
      {...{ [PRESET_SCOPE_ATTR]: "" }}
    >
      <div data-sevenui-example="" style={contain ? { contain: "layout paint" } : undefined}>
        {children}
      </div>
    </div>
  );
}
