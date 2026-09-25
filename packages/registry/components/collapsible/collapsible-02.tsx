"use client";

import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

export default function Collapsible02() {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="w-full max-w-md text-sm leading-relaxed"
    >
      <h3 className="mb-2 text-base font-semibold">About this workspace</h3>
      <p className="text-muted-foreground">
        Northwind Studio is a twelve-person product team shipping the mobile
        booking app for independent fitness studios. We plan in two-week cycles
        and review designs every Thursday.
      </p>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 pt-3 text-muted-foreground">
          <p>
            New members get read access to every project by default. Editors
            can publish to staging, while production releases need approval
            from one of the three workspace admins.
          </p>
          <p>
            Questions about access or billing go to the #ops channel, which is
            staffed from 9am to 6pm Central European Time on weekdays.
          </p>
        </div>
      </CollapsibleContent>
      <CollapsibleTrigger className="mt-2 rounded-sm font-medium text-foreground underline underline-offset-4 decoration-border outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        {open ? "Show less" : "Read more"}
      </CollapsibleTrigger>
    </Collapsible>
  );
}
