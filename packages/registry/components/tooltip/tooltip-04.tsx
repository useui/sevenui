"use client";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const people = [
  {
    name: "Maya Chen",
    initials: "MC",
    role: "Product designer",
    status: "Editing “Pricing page”",
    online: true,
  },
  {
    name: "Jonas Weber",
    initials: "JW",
    role: "Frontend engineer",
    status: "Viewing comments",
    online: true,
  },
  {
    name: "Priya Nair",
    initials: "PN",
    role: "Content strategist",
    status: "Last seen 25 min ago",
    online: false,
  },
  {
    name: "Luca Romano",
    initials: "LR",
    role: "Engineering manager",
    status: "Last seen yesterday",
    online: false,
  },
];

const hidden = ["Sara Holm", "Diego Alves", "Ada Okafor"];

// Light, elevated surface for rich content; the arrow follows the surface.
const richContent =
  "max-w-60 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg [&>[data-side]]:border-b [&>[data-side]]:border-r [&>[data-side]]:border-border [&>[data-side]]:bg-popover";

const triggerClassName =
  "relative rounded-full outline-none hover:z-10 focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60";

export default function Tooltip04() {
  return (
    <TooltipProvider>
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        <AvatarGroup>
          {people.map((person) => (
            <Tooltip key={person.name}>
              <TooltipTrigger
                aria-label={`${person.name}, ${person.status}`}
                className={triggerClassName}
              >
                <Avatar size="lg" className="ring-2 ring-background">
                  <AvatarImage src="/placeholder.svg" alt="" />
                  <AvatarFallback>{person.initials}</AvatarFallback>
                  {person.online && <AvatarBadge className="bg-success" />}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent className={richContent}>
                <div className="flex items-center gap-2.5">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="" />
                    <AvatarFallback className="text-xs">
                      {person.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {person.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {person.role}
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 border-t border-border pt-2 text-xs text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className={
                      person.online
                        ? "size-1.5 rounded-full bg-success"
                        : "size-1.5 rounded-full bg-muted-foreground/40"
                    }
                  />
                  {person.status}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger
              aria-label={`${hidden.length} more collaborators`}
              className={triggerClassName}
            >
              <AvatarGroupCount className="size-10 text-xs font-medium">
                +{hidden.length}
              </AvatarGroupCount>
            </TooltipTrigger>
            <TooltipContent>{hidden.join(", ")}</TooltipContent>
          </Tooltip>
        </AvatarGroup>
        <p className="text-xs text-muted-foreground">
          7 people have access to this file
        </p>
      </div>
    </TooltipProvider>
  );
}
