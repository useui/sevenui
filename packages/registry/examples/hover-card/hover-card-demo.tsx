"use client";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger
        href="https://base-ui.com"
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium underline underline-offset-4"
      >
        @base_ui
      </HoverCardTrigger>
      <HoverCardContent className="flex gap-3">
        <Avatar>
          <AvatarFallback>BU</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h4 className="font-medium text-sm">Base UI</h4>
          <p className="text-muted-foreground text-sm">
            Unstyled UI components for React, by the MUI team.
          </p>
          <p className="text-muted-foreground text-xs">Joined 2024</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
