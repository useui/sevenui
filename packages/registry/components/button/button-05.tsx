"use client";

import { ChevronRight, Inbox } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

const collaborators = [
  { initials: "MC", name: "Maya Chen" },
  { initials: "JO", name: "Jonas Olsen" },
  { initials: "PR", name: "Priya Raman" },
];

export default function Button05() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost">
          <Inbox aria-hidden="true" />
          Inbox
          <Badge className="ml-0.5 h-4.5 min-w-4.5 px-1.5 tabular-nums">
            12
            <span className="sr-only"> unread</span>
          </Badge>
        </Button>
        <Button variant="outline">
          Mentions
          <Badge variant="secondary" className="ml-0.5 h-4.5 min-w-4.5 px-1.5 tabular-nums">
            3
            <span className="sr-only"> new</span>
          </Badge>
        </Button>
      </div>
      <Button variant="outline" className="w-fit pl-1.5">
        <AvatarGroup aria-hidden="true" className="-space-x-1 *:data-[slot=avatar]:ring-background">
          {collaborators.map((person) => (
            <Avatar key={person.initials} size="sm">
              <AvatarFallback className="text-xs">{person.initials.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        <span className="ml-1">Share with 3 editors</span>
      </Button>
      <Button size="lg" className="h-11 w-full justify-start gap-3 pl-1.5">
        <Avatar aria-hidden="true">
          <AvatarFallback className="bg-primary-foreground/15 text-xs text-primary-foreground">
            MC
          </AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-col items-start text-left leading-tight">
          <span className="truncate">Continue as Maya Chen</span>
          <span className="truncate text-xs font-normal text-primary-foreground/70">
            maya@northwind.studio
          </span>
        </span>
        <ChevronRight aria-hidden="true" className="ml-auto opacity-70" />
      </Button>
    </div>
  );
}
