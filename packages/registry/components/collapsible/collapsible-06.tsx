"use client";

import { ChevronRightIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

type Member = { name: string; role: string };
type Team = { name: string; members: Member[]; teams?: Team[] };

const org: Team = {
  name: "Engineering",
  members: [{ name: "Maya Chen", role: "VP of Engineering" }],
  teams: [
    {
      name: "Platform",
      members: [
        { name: "Daniel Okafor", role: "Engineering Manager" },
        { name: "Priya Raman", role: "Staff Engineer" },
      ],
      teams: [
        {
          name: "Infrastructure",
          members: [
            { name: "Lucas Moreau", role: "Site Reliability Engineer" },
            { name: "Hana Sato", role: "Backend Engineer" },
          ],
        },
      ],
    },
    {
      name: "Product",
      members: [
        { name: "Sofia Lindqvist", role: "Engineering Manager" },
        { name: "Omar Haddad", role: "Frontend Engineer" },
        { name: "Grace Kim", role: "Mobile Engineer" },
      ],
    },
  ],
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

const countMembers = (team: Team): number =>
  team.members.length +
  (team.teams ?? []).reduce((sum, child) => sum + countMembers(child), 0);

function TeamNode({
  team,
  defaultOpen,
}: {
  team: Team;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
        <ChevronRightIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-90"
        />
        <span className="flex-1 truncate font-medium">{team.name}</span>
        <AvatarGroup
          aria-hidden="true"
          className="-space-x-1.5 transition-opacity duration-200 group-data-panel-open:opacity-0"
        >
          {team.members.slice(0, 3).map((member) => (
            <Avatar key={member.name} size="sm">
              <AvatarFallback className="group-data-[size=sm]/avatar:text-[0.625rem]">
                {initials(member.name)}
              </AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">
          {countMembers(team)}
          <span className="sr-only"> members</span>
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 flex flex-col gap-0.5 border-l pl-2">
          <ul className="flex flex-col">
            {team.members.map((member) => (
              <li
                key={member.name}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
              >
                <Avatar size="sm">
                  <AvatarImage src="/placeholder.svg" alt="" />
                  <AvatarFallback className="group-data-[size=sm]/avatar:text-[0.625rem]">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm">{member.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {member.role}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {team.teams?.map((child) => (
            <TeamNode key={child.name} team={child} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Collapsible06() {
  return (
    <section
      aria-label="Engineering org chart"
      className="w-full max-w-sm rounded-lg border bg-card p-2"
    >
      <TeamNode team={org} defaultOpen />
    </section>
  );
}
