"use client";

import { UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";

const people = [
  { name: "Maya Chen", initials: "MC", role: "Owner" },
  { name: "Daniel Okafor", initials: "DO", role: "Reviewer" },
  { name: "Lena Fischer", initials: "LF", role: "Reviewer" },
];

const workspaces = [
  { name: "Billing service", count: 12 },
  { name: "Design tokens", count: 4 },
];

export default function Badge06() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          With avatar
        </p>
        <ul className="flex flex-wrap gap-2">
          {people.map((person) => (
            <li key={person.name}>
              <Badge
                variant="outline"
                className="h-7 gap-1.5 bg-card py-0 pr-2.5 pl-0.5 text-sm"
              >
                <Avatar className="size-6 after:hidden">
                  <AvatarImage src="/placeholder.svg" alt="" />
                  <AvatarFallback className="text-[10px]">
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                {person.name}
                <span className="text-xs font-normal text-muted-foreground">
                  {person.role}
                </span>
              </Badge>
            </li>
          ))}
          <li>
            <Badge
              variant="outline"
              className="h-7 gap-1.5 border-dashed py-0 pr-2.5 pl-2 text-sm font-normal text-muted-foreground [&>svg]:size-3.5!"
            >
              <UserPlus aria-hidden="true" />
              Unassigned
            </Badge>
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          With thumbnail
        </p>
        <ul className="flex flex-wrap gap-2">
          {workspaces.map((workspace) => (
            <li key={workspace.name}>
              <Badge
                variant="secondary"
                className="h-7 gap-1.5 rounded-md py-0 pr-1 pl-1 text-sm"
              >
                <img
                  src="/placeholder.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 rounded-sm bg-muted object-cover"
                />
                {workspace.name}
                <span className="ml-0.5 rounded-sm bg-background px-1.5 text-xs text-muted-foreground tabular-nums">
                  {workspace.count}
                  <span className="sr-only"> open issues</span>
                </span>
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
