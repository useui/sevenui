"use client";

import { Archive, Clock, Forward, Reply, Trash2 } from "lucide-react";

import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";

const actions = [
  { id: "reply", label: "Reply", icon: Reply, variant: "ghost" },
  { id: "forward", label: "Forward", icon: Forward, variant: "ghost" },
  { id: "snooze", label: "Snooze", icon: Clock, variant: "ghost" },
  { id: "archive", label: "Archive", icon: Archive, variant: "ghost" },
  { id: "delete", label: "Delete", icon: Trash2, variant: "destructive" },
] as const;

export default function Button10() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground">
      <div className="flex flex-wrap items-center gap-1">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant}
            className={cn(
              "group/expand gap-0 px-2 has-data-[icon=inline-start]:pl-2",
              action.id === "delete" && "ml-auto",
            )}
          >
            <action.icon aria-hidden="true" />
            <span className="max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity,margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/expand:ml-1.5 group-hover/expand:max-w-20 group-hover/expand:opacity-100 group-focus-visible/expand:ml-1.5 group-focus-visible/expand:max-w-20 group-focus-visible/expand:opacity-100 motion-reduce:transition-none">
              {action.label}
            </span>
          </Button>
        ))}
      </div>
      <div className="border-t px-1 pt-3">
        <p className="text-sm font-medium">Q3 roadmap review moved to Thursday</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          Priya shared the updated agenda. We will walk through the billing
          migration first, then the onboarding experiments.
        </p>
      </div>
    </div>
  );
}
