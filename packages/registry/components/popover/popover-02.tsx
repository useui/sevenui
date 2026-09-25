"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const sides: Side[] = ["top", "right", "bottom", "left"];
const aligns: Align[] = ["start", "center", "end"];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Popover02() {
  const [side, setSide] = React.useState<Side>("bottom");
  const [align, setAlign] = React.useState<Align>("center");

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span id="popover-02-side" className="text-sm font-medium">
          Side
        </span>
        <ToggleGroup
          aria-labelledby="popover-02-side"
          variant="outline"
          size="sm"
          spacing={0}
          value={[side]}
          onValueChange={(next) => {
            if (next.length > 0) setSide(next[0] as Side);
          }}
          className="w-full"
        >
          {sides.map((item) => (
            <ToggleGroupItem
              key={item}
              value={item}
              className="flex-1 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {capitalize(item)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex flex-col gap-1.5">
        <span id="popover-02-align" className="text-sm font-medium">
          Align
        </span>
        <ToggleGroup
          aria-labelledby="popover-02-align"
          variant="outline"
          size="sm"
          spacing={0}
          value={[align]}
          onValueChange={(next) => {
            if (next.length > 0) setAlign(next[0] as Align);
          }}
          className="w-full"
        >
          {aligns.map((item) => (
            <ToggleGroupItem
              key={item}
              value={item}
              className="flex-1 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {capitalize(item)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            Open schedule note
          </PopoverTrigger>
          <PopoverContent side={side} align={align} sideOffset={8} className="w-56">
            <PopoverHeader>
              <PopoverTitle>Maintenance window</PopoverTitle>
              <PopoverDescription>
                Deploys pause Sunday 02:00 to 04:00 UTC.
              </PopoverDescription>
            </PopoverHeader>
            <p className="font-mono text-xs text-muted-foreground">
              side="{side}" align="{align}"
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
