"use client";

import { UserX } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const members = [
  "Amara Nwosu",
  "Lucas Brandt",
  "Hana Sato",
  "Mateo Alvarez",
  "Ingrid Holm",
  "Ravi Chandran",
];

const tints = [
  "bg-chart-1/20 text-foreground",
  "bg-chart-2/20 text-foreground",
  "bg-chart-3/20 text-foreground",
  "bg-chart-4/25 text-foreground",
  "bg-chart-5/20 text-foreground",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Same name, same tint: a stable hash keeps colors consistent across screens.
function getTint(name: string) {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return tints[hash % tints.length];
}

export default function Avatar03() {
  return (
    <TooltipProvider>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {members.map((name) => (
            <Tooltip key={name}>
              <TooltipTrigger
                aria-label={name}
                className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Avatar size="lg">
                  <AvatarFallback className={`font-medium ${getTint(name)}`}>
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger
              aria-label="Deactivated account"
              className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Avatar size="lg" className="after:border-dashed">
                <AvatarFallback className="bg-transparent">
                  <UserX aria-hidden="true" className="size-4" />
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>Deactivated account</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm text-muted-foreground">
          Tints are derived from each name, so a teammate keeps the same color
          in every list, thread, and mention.
        </p>
      </div>
    </TooltipProvider>
  );
}
