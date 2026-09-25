"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const PEOPLE = [
  { id: "maya", name: "Maya Chen", role: "Design lead", initials: "MC" },
  { id: "omar", name: "Omar Haddad", role: "Frontend", initials: "OH" },
  { id: "priya", name: "Priya Raman", role: "Backend", initials: "PR" },
  { id: "lucas", name: "Lucas Moreau", role: "QA", initials: "LM" },
  { id: "sofia", name: "Sofia Novak", role: "Product", initials: "SN" },
];

const MAX_VISIBLE = 3;

export default function DropdownMenu08() {
  const [assigned, setAssigned] = React.useState<string[]>(["maya", "priya"]);
  const selected = PEOPLE.filter((person) => assigned.includes(person.id));
  const overflow = selected.length - MAX_VISIBLE;

  function toggle(id: string, checked: boolean) {
    setAssigned((prev) =>
      checked ? [...prev, id] : prev.filter((value) => value !== id),
    );
  }

  const summary =
    selected.length === 0
      ? "Unassigned"
      : selected.map((person) => person.name).join(", ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label={`Assignees: ${summary}. Edit assignees`}
            className="h-10 gap-2 border-dashed pr-3 pl-1.5 data-[selected=true]:border-solid"
            data-selected={selected.length > 0}
          >
            {selected.length === 0 ? (
              <>
                <span className="flex size-7 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                  <UserPlus aria-hidden="true" className="size-3.5" />
                </span>
                Assign
              </>
            ) : (
              <>
                <AvatarGroup aria-hidden="true" className="-space-x-1">
                  {selected.slice(0, MAX_VISIBLE).map((person) => (
                    <Avatar key={person.id} size="sm">
                      <AvatarFallback>{person.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                  {overflow > 0 ? (
                    <AvatarGroupCount className="text-xs">+{overflow}</AvatarGroupCount>
                  ) : null}
                </AvatarGroup>
                <span className="tabular-nums">
                  {selected.length === 1 ? selected[0].name : `${selected.length} assignees`}
                </span>
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64 max-w-[calc(100vw-2rem)]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Assign to</DropdownMenuLabel>
          {PEOPLE.map((person) => (
            <DropdownMenuCheckboxItem
              key={person.id}
              label={person.name}
              checked={assigned.includes(person.id)}
              onCheckedChange={(checked) => toggle(person.id, checked)}
              className="gap-2.5 py-1.5"
            >
              <Avatar size="sm">
                <AvatarFallback>{person.initials}</AvatarFallback>
              </Avatar>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{person.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {person.role}
                </span>
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={assigned.length === 0}
          onClick={() => setAssigned([])}
        >
          Clear assignees
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
