"use client";

import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  LayerCard,
  LayerCardAction,
  LayerCardDescription,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const origins = [
  { host: "api.example.com", requests: "1,204" },
  { host: "cdn.example.com", requests: "860" },
  { host: "auth.example.com", requests: "312" },
];

export default function LayerCardDemo() {
  return (
    <LayerCard className="w-full max-w-sm">
      <LayerCardHeader>
        <LayerCardTitle>Subrequests</LayerCardTitle>
        <LayerCardDescription>
          Origins this worker called in the last hour.
        </LayerCardDescription>
        <LayerCardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Open subrequests">
            <ArrowRightIcon />
          </Button>
        </LayerCardAction>
      </LayerCardHeader>
      <LayerCardPanel>
        <ul className="grid gap-2">
          {origins.map((origin) => (
            <li key={origin.host} className="flex items-center justify-between">
              <span className="font-mono text-xs">{origin.host}</span>
              <span className="tabular-nums text-muted-foreground">
                {origin.requests}
              </span>
            </li>
          ))}
        </ul>
      </LayerCardPanel>
      <LayerCardFooter>Showing 3 of 12 origins</LayerCardFooter>
    </LayerCard>
  );
}
