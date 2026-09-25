"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Separator } from "@/registry/base/ui/separator";

const groups = [
  {
    id: "overdue",
    label: "Overdue",
    tone: "text-destructive",
    open: true,
    tasks: [
      { title: "Renew the SSL certificate for api.acme.dev", due: "Sep 22" },
      { title: "Send Q3 usage report to finance", due: "Sep 24" },
    ],
  },
  {
    id: "today",
    label: "Today",
    tone: "text-foreground",
    open: true,
    tasks: [
      { title: "Review the onboarding copy pull request", due: "11:00" },
      { title: "Pair with Jonas on the export preset fix", due: "14:30" },
      { title: "Draft release notes for 3.2", due: "17:00" },
    ],
  },
  {
    id: "done",
    label: "Completed",
    tone: "text-muted-foreground",
    open: false,
    tasks: [
      { title: "Rotate staging database credentials", due: "Sep 23" },
      { title: "Archive the legacy billing dashboard", due: "Sep 23" },
      { title: "Close out the Q3 hiring retro", due: "Sep 22" },
    ],
  },
];

export default function Separator08() {
  const id = React.useId();

  return (
    <div className="flex w-full max-w-md flex-col gap-1">
      {groups.map((group) => (
        <Collapsible key={group.id} defaultOpen={group.open}>
          <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-md py-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <span className={`text-xs font-medium ${group.tone}`}>
              {group.label}
            </span>
            <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
              {group.tasks.length}
            </span>
            {/* A span keeps the separator valid inside the trigger button. */}
            <Separator
              render={<span />}
              className="flex-1 transition-colors group-hover:bg-foreground/20"
            />
            <ChevronDown
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180 motion-reduce:transition-none"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col pb-2">
              {group.tasks.map((task, index) => (
                <li key={task.title}>
                  <label
                    htmlFor={`${id}-${group.id}-${index}`}
                    className="flex cursor-pointer items-start gap-3 rounded-md px-1 py-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`${id}-${group.id}-${index}`}
                      defaultChecked={group.id === "done"}
                      className="mt-0.5"
                    />
                    <span className="flex-1 text-sm peer-data-checked:text-muted-foreground peer-data-checked:line-through">
                      {task.title}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {task.due}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
