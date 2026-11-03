"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { LabSection } from "../lab-frame";

function Example({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="flex w-64 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">3 repositories</span>
        <CollapsibleTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label="Toggle" />}
        >
          <ChevronsUpDownIcon />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <span>base-ui/react</span>
        <span>sevenui/registry</span>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CollapsibleMatrix() {
  return (
    <div>
      <LabSection title="closed / open">
        <Example />
        <Example defaultOpen />
      </LabSection>
    </div>
  );
}
