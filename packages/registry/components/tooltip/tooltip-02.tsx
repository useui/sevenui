"use client";

import * as React from "react";
import { Crosshair } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const sides: Side[] = ["top", "right", "bottom", "left"];
const aligns: Align[] = ["start", "center", "end"];

export default function Tooltip02() {
  const [side, setSide] = React.useState<Side>("top");
  const [align, setAlign] = React.useState<Align>("center");
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-5">
        <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40">
          <Tooltip open={open} onOpenChange={setOpen}>
            <TooltipTrigger
              render={
                <Button variant="outline">
                  <Crosshair aria-hidden="true" />
                  Recenter
                </Button>
              }
            />
            {/* Beside a centered trigger a phone leaves ~120px, so the side
                placements wrap narrower instead of flipping to another side. */}
            <TooltipContent
              side={side}
              align={align}
              className={
                side === "left" || side === "right"
                  ? "max-w-28 sm:max-w-xs"
                  : undefined
              }
            >
              Snap the map back to your location
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid gap-4 text-sm">
          <div className="grid gap-2">
            <span id="tooltip-02-side" className="font-medium">
              Side
            </span>
            <ToggleGroup
              aria-labelledby="tooltip-02-side"
              variant="outline"
              size="sm"
              spacing={0}
              value={[side]}
              onValueChange={(value) => {
                if (value[0]) {
                  setSide(value[0] as Side);
                  setOpen(true);
                }
              }}
              className="w-full"
            >
              {sides.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="flex-1 capitalize"
                >
                  {value}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid gap-2">
            <span id="tooltip-02-align" className="font-medium">
              Align
            </span>
            <ToggleGroup
              aria-labelledby="tooltip-02-align"
              variant="outline"
              size="sm"
              spacing={0}
              value={[align]}
              onValueChange={(value) => {
                if (value[0]) {
                  setAlign(value[0] as Align);
                  setOpen(true);
                }
              }}
              className="w-full"
            >
              {aligns.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="flex-1 capitalize"
                >
                  {value}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <code className="rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
            {`<TooltipContent side="${side}" align="${align}" />`}
          </code>
        </div>
      </div>
    </TooltipProvider>
  );
}
