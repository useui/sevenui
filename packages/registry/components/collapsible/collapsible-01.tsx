"use client";

import { ChevronDownIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

const changes = [
  "Workspace invites now expire after 7 days instead of 30.",
  "CSV exports include the timezone of every timestamp.",
  "Fixed a crash when renaming a project with an emoji in its name.",
];

export default function Collapsible01() {
  return (
    <Collapsible className="w-full max-w-md rounded-lg border bg-background">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="flex flex-col gap-0.5">
          <span>Version 4.12 release notes</span>
          <span className="text-xs font-normal text-muted-foreground">
            Published September 18
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex list-disc flex-col gap-1.5 border-t py-3 pr-4 pl-8 text-sm text-muted-foreground">
          {changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
