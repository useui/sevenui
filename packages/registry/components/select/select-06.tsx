"use client";

import { UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Label } from "@/registry/base/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const people = [
  { value: "maya-chen", name: "Maya Chen", initials: "MC", role: "Design" },
  { value: "omar-haddad", name: "Omar Haddad", initials: "OH", role: "Frontend" },
  { value: "lena-fischer", name: "Lena Fischer", initials: "LF", role: "Backend" },
  { value: "diego-alvarez", name: "Diego Alvarez", initials: "DA", role: "QA" },
];

const items = [{ value: "unassigned", label: "Unassigned" }].concat(
  people.map((person) => ({ value: person.value, label: person.name })),
);

function UnassignedIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground"
    >
      <UserRound className="size-3.5" />
    </span>
  );
}

export default function Select06() {
  return (
    <div className="grid w-full max-w-xs gap-1.5">
      <Label htmlFor="select-06-assignee">Assignee</Label>
      <Select items={items} defaultValue="omar-haddad">
        <SelectTrigger id="select-06-assignee" className="h-10 w-full pl-1.5">
          <SelectValue>
            {(current: string | null) => {
              const person = people.find((item) => item.value === current);
              if (!person) {
                return (
                  <>
                    <UnassignedIcon />
                    <span className="text-muted-foreground">Unassigned</span>
                  </>
                );
              }
              return (
                <>
                  <Avatar size="sm">
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                  {person.name}
                </>
              );
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned" className="py-1.5">
            <UnassignedIcon />
            <span className="text-muted-foreground">Unassigned</span>
          </SelectItem>
          <SelectSeparator />
          {people.map((person) => (
            <SelectItem key={person.value} value={person.value} className="py-1.5">
              <Avatar size="sm">
                <AvatarFallback>{person.initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1">{person.name}</span>
              <span className="text-xs text-muted-foreground">{person.role}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
