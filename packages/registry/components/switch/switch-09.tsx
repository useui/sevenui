"use client";

import { Lock } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";

const policies = [
  {
    id: "switch-09-reviews",
    label: "Require pull request reviews",
    description: "At least one approval before merging into main.",
    checked: true,
    managedBy: "Required by the Northwind organization ruleset. Ask an org owner to change it.",
  },
  {
    id: "switch-09-force-push",
    label: "Allow force pushes",
    description: "Anyone with write access can rewrite main's history.",
    checked: false,
    managedBy: "Blocked by the Northwind organization ruleset. Ask an org owner to change it.",
  },
  {
    id: "switch-09-delete-branches",
    label: "Delete head branches",
    description: "Remove the source branch after a pull request merges.",
    checked: true,
    managedBy: null,
  },
];

export default function Switch09() {
  return (
    <section
      aria-labelledby="switch-09-title"
      className="w-full max-w-sm rounded-lg border border-border bg-card text-card-foreground"
    >
      <div className="flex flex-col gap-0.5 border-b border-border px-4 py-3">
        <h3 id="switch-09-title" className="text-sm font-medium">
          Branch protection
        </h3>
        <p className="text-xs text-muted-foreground">
          Rules for <code className="font-mono text-foreground">main</code> in northwind/storefront
        </p>
      </div>
      <div className="flex flex-col divide-y divide-border">
        {policies.map((policy) => {
          const noteId = `${policy.id}-note`;
          return (
            <div key={policy.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor={policy.id}>{policy.label}</Label>
                  {policy.managedBy ? (
                    <Tooltip>
                      <TooltipTrigger
                        aria-label={`Why ${policy.label} is locked`}
                        className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <Lock aria-hidden="true" className="size-3.5" />
                      </TooltipTrigger>
                      <TooltipContent side="top">{policy.managedBy}</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">{policy.description}</span>
                {policy.managedBy ? (
                  <span id={noteId} className="sr-only">
                    {policy.managedBy}
                  </span>
                ) : null}
              </div>
              <Switch
                id={policy.id}
                defaultChecked={policy.checked}
                readOnly={policy.managedBy !== null}
                aria-describedby={policy.managedBy ? noteId : undefined}
                className="mt-0.5 data-readonly:cursor-not-allowed data-readonly:opacity-70"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
