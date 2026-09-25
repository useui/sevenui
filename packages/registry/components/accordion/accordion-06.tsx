"use client";

import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import { Button } from "@/registry/base/ui/button";

const sections = [
  {
    value: "features",
    title: "New features",
    changes: [
      "Saved views can now be shared with a public read-only link.",
      "Bulk edit supports up to 500 rows at a time.",
    ],
  },
  {
    value: "improvements",
    title: "Improvements",
    changes: [
      "Search results load about twice as fast on large workspaces.",
      "CSV exports keep your column order and filters.",
    ],
  },
  {
    value: "fixes",
    title: "Bug fixes",
    changes: [
      "Fixed dates shifting by a day for users west of UTC.",
      "Comment mentions no longer drop trailing punctuation.",
    ],
  },
  {
    value: "deprecations",
    title: "Deprecations",
    changes: [
      "The v1 webhooks endpoint stops accepting requests on March 31.",
    ],
  },
];

const allValues = sections.map((section) => section.value);

export default function Accordion06() {
  const [open, setOpen] = React.useState<string[]>(["features"]);
  const allOpen = open.length === allValues.length;

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold">Release 2.4.0</h3>
          <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {open.length} of {allValues.length} sections expanded
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(allOpen ? [] : allValues)}
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </Button>
      </div>
      <Accordion
        multiple
        value={open}
        onValueChange={(next) => setOpen(next as string[])}
        className="rounded-xl border px-4"
      >
        {sections.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>
              <span className="flex items-baseline gap-2">
                {section.title}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {section.changes.length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-muted-foreground marker:text-border">
                {section.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
