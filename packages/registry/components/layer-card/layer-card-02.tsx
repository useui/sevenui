"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import {
  LayerCard,
  LayerCardAction,
  LayerCardDescription,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const steps = ["Install dependencies", "Type check", "Run tests", "Build", "Upload assets"];

export default function LayerCard02() {
  const [open, setOpen] = React.useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm">
      <LayerCard>
        <LayerCardHeader>
          <LayerCardTitle>Build #482</LayerCardTitle>
          <LayerCardDescription>Finished in 1 min 12 s</LayerCardDescription>
          <LayerCardAction>
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={open ? "Hide build steps" : "Show build steps"}
                />
              }
            >
              <ChevronDownIcon
                className="transition-transform duration-200 data-[open=true]:rotate-180"
                data-open={open}
              />
            </CollapsibleTrigger>
          </LayerCardAction>
        </LayerCardHeader>
        {/* keepMounted keeps the panel in the DOM while closed, so the tray
            stays in panel mode instead of flipping to a plain surface. The
            padding lives on the list: a padded panel cannot animate its
            height below that padding. */}
        <CollapsibleContent keepMounted render={<LayerCardPanel className="p-0" />}>
          <ol className="grid gap-2 px-(--layer-card-panel-px) py-(--layer-card-panel-py)">
            {steps.map((step) => (
              <li key={step} className="flex items-center gap-2">
                <CheckIcon className="size-4 text-muted-foreground" />
                {step}
              </li>
            ))}
          </ol>
        </CollapsibleContent>
      </LayerCard>
    </Collapsible>
  );
}
