"use client";

import * as React from "react";
import {
  AlignCenterHorizontalIcon,
  AlignEndHorizontalIcon,
  AlignStartHorizontalIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  PackageIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const sides: { value: Side; label: string; icon: typeof ArrowUpIcon }[] = [
  { value: "top", label: "Top", icon: ArrowUpIcon },
  { value: "right", label: "Right", icon: ArrowRightIcon },
  { value: "bottom", label: "Bottom", icon: ArrowDownIcon },
  { value: "left", label: "Left", icon: ArrowLeftIcon },
];

const aligns: { value: Align; label: string; icon: typeof ArrowUpIcon }[] = [
  { value: "start", label: "Start", icon: AlignStartHorizontalIcon },
  { value: "center", label: "Center", icon: AlignCenterHorizontalIcon },
  { value: "end", label: "End", icon: AlignEndHorizontalIcon },
];

export default function HoverCard03() {
  const [side, setSide] = React.useState<Side>("top");
  const [align, setAlign] = React.useState<Align>("center");

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span id="hover-card-side-label" className="text-sm font-medium">
            Side
          </span>
          <ToggleGroup
            aria-labelledby="hover-card-side-label"
            variant="outline"
            size="sm"
            spacing={0}
            value={[side]}
            onValueChange={(next) => {
              if (next.length > 0) setSide(next[0] as Side);
            }}
          >
            {sides.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                aria-label={item.label}
              >
                <item.icon aria-hidden="true" />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span id="hover-card-align-label" className="text-sm font-medium">
            Align
          </span>
          <ToggleGroup
            aria-labelledby="hover-card-align-label"
            variant="outline"
            size="sm"
            spacing={0}
            value={[align]}
            onValueChange={(next) => {
              if (next.length > 0) setAlign(next[0] as Align);
            }}
          >
            {aligns.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                aria-label={item.label}
              >
                <item.icon aria-hidden="true" />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <div className="flex w-full justify-center rounded-lg border border-dashed border-border py-10">
        <HoverCard>
          <HoverCardTrigger
            render={<Button variant="outline" />}
          >
            <PackageIcon aria-hidden="true" />
            Order 48213
          </HoverCardTrigger>
          <HoverCardContent
            side={side}
            align={align}
            className="flex w-60 flex-col gap-2 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Arriving Thursday</span>
              <span className="text-xs text-muted-foreground">2 of 3</span>
            </div>
            <p className="text-muted-foreground">
              Left the Rotterdam hub at 06:40. The courier will text a
              one-hour window on the morning of delivery.
            </p>
            <code className="w-fit rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              side=&quot;{side}&quot; align=&quot;{align}&quot;
            </code>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
}
