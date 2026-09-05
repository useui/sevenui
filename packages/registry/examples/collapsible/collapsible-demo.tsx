"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

export default function CollapsibleDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex w-full max-w-sm flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4">
        <h4 className="text-sm font-semibold">
          @owuzan starred 3 repositories
        </h4>
        <CollapsibleTrigger
          render={<Button variant="ghost" size="icon" className="size-8" />}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
          </svg>
          <span className="sr-only">Toggle</span>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">
        shadcn-ui/ui
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          mui/base-ui
        </div>
        <div className="rounded-md border px-4 py-2 font-mono text-sm">
          useui/sevenui
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
