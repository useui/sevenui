"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const roles = [
  { value: "admin", label: "Admin", hint: "Billing, members, all projects" },
  { value: "developer", label: "Developer", hint: "Deploy and manage projects" },
  { value: "viewer", label: "Viewer", hint: "Read-only access to logs" },
];

const members = [
  {
    id: "maya",
    name: "Maya Patel",
    email: "maya@northwind.io",
    initials: "MP",
    role: "owner",
  },
  {
    id: "daniel",
    name: "Daniel Okafor",
    email: "daniel@northwind.io",
    initials: "DO",
    role: "admin",
  },
  {
    id: "lena",
    name: "Lena Fischer",
    email: "lena@northwind.io",
    initials: "LF",
    role: "developer",
  },
  {
    id: "tom",
    name: "Tom Alvarez",
    email: "tom@northwind.io",
    initials: "TA",
    role: "viewer",
  },
];

const initialRoles = Object.fromEntries(
  members.map((member) => [member.id, member.role]),
) as Record<string, string>;

export default function Select10() {
  const [saved, setSaved] = useState<Record<string, string>>(initialRoles);
  const [draft, setDraft] = useState<Record<string, string>>(initialRoles);
  const [status, setStatus] = useState("");

  const pending = members.filter(
    (member) => draft[member.id] !== saved[member.id],
  ).length;

  return (
    <section
      aria-labelledby="select-10-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-3">
        <h3 id="select-10-title" className="font-medium">
          Members
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {members.length} of 10 seats
        </span>
      </header>
      <ul className="divide-y border-t">
        {members.map((member) => {
          const isOwner = member.role === "owner";
          const edited = draft[member.id] !== saved[member.id];

          return (
            <li key={member.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar className="max-sm:hidden">
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                  <span className="truncate">{member.name}</span>
                  {edited ? (
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full bg-primary"
                    />
                  ) : null}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {member.email}
                </span>
              </div>
              {isOwner ? (
                <Badge variant="secondary">Owner</Badge>
              ) : (
                <Select
                  items={roles}
                  value={draft[member.id]}
                  onValueChange={(next) => {
                    setStatus("");
                    setDraft((current) => ({
                      ...current,
                      [member.id]: next ?? saved[member.id],
                    }));
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label={`Role for ${member.name}${edited ? ", unsaved change" : ""}`}
                    className="w-28 shrink-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end" alignItemWithTrigger={false} className="min-w-56">
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <span className="flex flex-col">
                          <span>{role.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {role.hint}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </li>
          );
        })}
      </ul>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {pending > 0
            ? `${pending} unsaved ${pending === 1 ? "change" : "changes"}`
            : status || "Roles are up to date"}
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending === 0}
            onClick={() => setDraft(saved)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            disabled={pending === 0}
            onClick={() => {
              setSaved(draft);
              setStatus(
                `Updated ${pending} ${pending === 1 ? "role" : "roles"}`,
              );
            }}
          >
            Save changes
          </Button>
        </div>
      </footer>
    </section>
  );
}
