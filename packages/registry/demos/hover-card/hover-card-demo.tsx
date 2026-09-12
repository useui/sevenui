"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger
        href="https://x.com/sevenuidev"
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium underline underline-offset-4"
      >
        @sevenuidev
      </HoverCardTrigger>
      <HoverCardContent className="flex w-72 gap-3">
        <Avatar>
          <AvatarImage src="/logomark.svg" alt="SevenUI" />
          <AvatarFallback>7U</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h4 className="text-sm font-medium">
            SevenUI{" "}
            <span className="font-normal text-muted-foreground">
              @sevenuidev
            </span>
          </h4>
          <p className="text-sm text-muted-foreground">
            A shadcn-compatible component registry built entirely on Base UI —
            no Radix, anywhere.
          </p>
          <p className="text-xs text-muted-foreground">sevenui.dev · Joined 2026</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
