"use client";

import {
  ChevronRightIcon,
  KeyRoundIcon,
  LockIcon,
  ReceiptIcon,
  ScrollTextIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

const apiKeys = [
  { name: "Production server", suffix: "8f2a", lastUsed: "2 minutes ago" },
  { name: "Staging worker", suffix: "c41e", lastUsed: "Yesterday" },
];

const triggerClassName =
  "group flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset data-disabled:cursor-not-allowed data-disabled:hover:bg-transparent";

const chevron = (
  <ChevronRightIcon
    aria-hidden="true"
    className="size-4 text-muted-foreground transition-transform duration-200 group-data-disabled:opacity-40 group-data-panel-open:rotate-90"
  />
);

export default function Collapsible04() {
  return (
    <div className="w-full max-w-md divide-y overflow-hidden rounded-lg border">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className={triggerClassName}>
          <KeyRoundIcon aria-hidden="true" className="size-4" />
          <span className="flex-1">API keys</span>
          <Badge variant="outline">Read-only</Badge>
          {chevron}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="flex flex-col gap-2 px-4 pb-4">
            {apiKeys.map((key) => (
              <li
                key={key.suffix}
                className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{key.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    sk_live_••••{key.suffix}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {key.lastUsed}
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <CollapsibleTrigger className={triggerClassName}>
          <ReceiptIcon aria-hidden="true" className="size-4" />
          <span className="flex-1">Invoices</span>
          <span className="text-xs font-normal text-muted-foreground">
            Empty
          </span>
          {chevron}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mx-4 mb-4 flex flex-col items-center gap-1 rounded-md border border-dashed px-4 py-6 text-center">
            <p className="text-sm font-medium">No invoices yet</p>
            <p className="text-xs text-muted-foreground">
              Your first invoice arrives when the trial ends on October 9.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible disabled>
        <CollapsibleTrigger className={triggerClassName}>
          <ScrollTextIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          <span className="flex-1 text-muted-foreground">Audit log</span>
          <Badge variant="secondary">
            <LockIcon aria-hidden="true" />
            Enterprise
          </Badge>
          {chevron}
        </CollapsibleTrigger>
        <CollapsibleContent />
      </Collapsible>
      <div className="flex items-center justify-between gap-3 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <span>Audit log requires the Enterprise plan.</span>
        <Button size="xs" variant="outline">
          Compare plans
        </Button>
      </div>
    </div>
  );
}
