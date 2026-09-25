"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Settings, UserPlus } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const workspaces = [
  { id: "northwind", name: "Northwind Labs", initials: "NL", plan: "Team", members: 24 },
  { id: "halcyon", name: "Halcyon Studio", initials: "HS", plan: "Pro", members: 6 },
  { id: "personal", name: "Ines Moreau", initials: "IM", plan: "Free", members: 1 },
];

// Tint each workspace mark with a different chart token so they stay apart at a glance.
const markColors: Record<string, string> = {
  northwind: "bg-chart-1/20 text-foreground",
  halcyon: "bg-chart-2/20 text-foreground",
  personal: "bg-muted text-muted-foreground",
};

function WorkspaceMark({ id, initials }: { id: string; initials: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${markColors[id]}`}
    >
      {initials}
    </span>
  );
}

export default function DropdownMenu10() {
  const [active, setActive] = React.useState("northwind");
  const current = workspaces.find((w) => w.id === active) ?? workspaces[0];

  return (
    <div className="w-full max-w-64 rounded-xl border border-border bg-sidebar p-2 text-sidebar-foreground">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={`Switch workspace, current: ${current.name}`}
              className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-popup-open:bg-sidebar-accent"
            >
              <WorkspaceMark id={current.id} initials={current.initials} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{current.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {current.plan} plan · {current.members}{" "}
                  {current.members === 1 ? "member" : "members"}
                </span>
              </span>
              <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            </button>
          }
        />
        <DropdownMenuContent align="start" className="w-(--anchor-width) min-w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={active}
              onValueChange={(value) => setActive(value as string)}
            >
              {workspaces.map((workspace) => (
                <DropdownMenuRadioItem
                  key={workspace.id}
                  value={workspace.id}
                  label={workspace.name}
                  closeOnClick
                  className="gap-2 py-1.5"
                >
                  <WorkspaceMark id={workspace.id} initials={workspace.initials} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{workspace.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {workspace.members}{" "}
                      {workspace.members === 1 ? "member" : "members"}
                    </span>
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    {workspace.plan}
                  </Badge>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserPlus aria-hidden="true" />
            Invite people to {current.name}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings aria-hidden="true" />
            Workspace settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-md border border-dashed border-border">
              <Plus aria-hidden="true" className="size-3.5" />
            </span>
            Create workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
