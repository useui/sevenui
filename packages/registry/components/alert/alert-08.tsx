"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronDownIcon, FileWarningIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

const issues = [
  { row: 14, field: "email", message: "“jordan@” is not a valid address" },
  { row: 37, field: "plan", message: "“Enterprize” does not match a plan" },
  { row: 52, field: "seats", message: "Must be a whole number, got 2.5" },
];

export default function Alert08() {
  const [open, setOpen] = React.useState(false);

  return (
    <Alert variant="destructive" className="w-full max-w-md">
      <FileWarningIcon aria-hidden="true" />
      <AlertTitle>3 of 120 rows were skipped</AlertTitle>
      <AlertDescription>
        <div>The rest of customers.csv imported successfully.</div>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="-mx-1 mt-1 inline-flex items-center gap-1 rounded-sm px-1 font-medium text-destructive outline-none hover:underline focus-visible:ring-3 focus-visible:ring-destructive/30">
            {open ? "Hide details" : "Show details"}
            <ChevronDownIcon
              aria-hidden="true"
              className={cn(
                "size-3.5 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 divide-y divide-destructive/15 rounded-md border border-destructive/20 text-xs">
              {issues.map((issue) => (
                <li key={issue.row} className="grid gap-0.5 px-2.5 py-2">
                  <span className="font-medium tabular-nums">
                    Row {issue.row} &middot;{" "}
                    <code className="font-mono">{issue.field}</code>
                  </span>
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </AlertDescription>
    </Alert>
  );
}
