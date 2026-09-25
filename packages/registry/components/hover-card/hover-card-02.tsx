"use client";

import { ClockIcon, GlobeIcon } from "lucide-react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

export default function HoverCard02() {
  return (
    <p className="w-full max-w-md text-sm leading-relaxed text-muted-foreground">
      Before you ship the new palette, skim{" "}
      <HoverCard>
        <HoverCardTrigger
          href="#designing-for-dark-mode"
          className="rounded-sm font-medium text-foreground underline decoration-muted-foreground/60 underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:decoration-foreground"
        >
          Designing for dark mode
        </HoverCardTrigger>
        <HoverCardContent className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden p-0">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            <img
              src="/placeholder.svg"
              alt="Two versions of a settings screen, one light and one dark"
              className="size-full object-cover"
            />
          </AspectRatio>
          <div className="flex flex-col gap-1.5 p-3">
            <span className="font-medium leading-snug">
              Designing for dark mode: contrast, elevation, and color
            </span>
            <p className="line-clamp-2 text-muted-foreground">
              Why pure black backgrounds fail, how to express elevation
              without shadows, and which tokens need a second value.
            </p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <GlobeIcon className="size-3" aria-hidden="true" />
                sevenui.dev
              </span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="size-3" aria-hidden="true" />
                7 min read
              </span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{" "}
      from the design guild. It covers the contrast checks we run in review.
    </p>
  );
}
