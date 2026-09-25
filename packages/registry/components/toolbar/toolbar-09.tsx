"use client";

import { SearchIcon, UserPlusIcon } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Toggle } from "@/registry/base/ui/toggle";
import { ToggleGroup } from "@/registry/base/ui/toggle-group";
import {
  Toolbar,
  ToolbarButton,
  ToolbarInput,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

type Role = "owner" | "admin" | "member";

const members: {
  name: string;
  email: string;
  initials: string;
  role: Role;
  pending?: boolean;
}[] = [
  {
    name: "Amara Okafor",
    email: "amara@northwind.io",
    initials: "AO",
    role: "owner",
  },
  {
    name: "Daniel Brooks",
    email: "daniel@northwind.io",
    initials: "DB",
    role: "admin",
  },
  {
    name: "Lena Fischer",
    email: "lena@northwind.io",
    initials: "LF",
    role: "member",
  },
  {
    name: "Kenji Watanabe",
    email: "kenji@northwind.io",
    initials: "KW",
    role: "member",
    pending: true,
  },
  {
    name: "Sofia Marino",
    email: "sofia@northwind.io",
    initials: "SM",
    role: "admin",
  },
];

const filters = [
  { value: "all", label: "All" },
  { value: "admin", label: "Admins" },
  { value: "member", label: "Members" },
];

const roleLabel: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export default function Toolbar09() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const visible = members.filter((member) => {
    const matchesRole =
      filter === "all" ||
      member.role === filter ||
      (filter === "admin" && member.role === "owner");
    const matchesQuery =
      needle === "" ||
      member.name.toLowerCase().includes(needle) ||
      member.email.includes(needle);
    return matchesRole && matchesQuery;
  });

  return (
    <section
      aria-labelledby="toolbar-09-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground shadow-xs"
    >
      <div className="flex items-start justify-between gap-4 p-4 pb-3">
        <div className="flex flex-col gap-0.5">
          <h3 id="toolbar-09-title" className="text-sm font-semibold">
            Team members
          </h3>
          <p className="text-xs text-muted-foreground">
            5 of 8 seats used on the Team plan.
          </p>
        </div>
      </div>

      <div className="px-4">
        <Toolbar
          aria-label="Filter team members"
          className="w-full flex-wrap bg-muted/40"
        >
          <ToggleGroup
            aria-label="Role"
            value={[filter]}
            onValueChange={(value) => {
              if (value.length > 0) setFilter(value[0] as string);
            }}
          >
            {filters.map((item) => (
              <ToolbarButton
                key={item.value}
                render={<Toggle size="sm" />}
                value={item.value}
              >
                {item.label}
              </ToolbarButton>
            ))}
          </ToggleGroup>
          <ToolbarSeparator className="hidden sm:block" />
          <ToolbarButton aria-label="Invite member">
            <UserPlusIcon aria-hidden="true" />
            <span className="hidden sm:inline">Invite</span>
          </ToolbarButton>
          <div className="relative min-w-0 flex-1 basis-40">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <ToolbarInput
              type="search"
              aria-label="Search by name or email"
              placeholder="Search members"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-background pl-7"
            />
          </div>
        </Toolbar>
      </div>

      <ul aria-live="polite" className="flex flex-col p-2">
        {visible.length === 0 ? (
          <li className="px-2 py-8 text-center text-sm text-muted-foreground">
            No one matches “{query}”. Check the spelling or invite them.
          </li>
        ) : (
          visible.map((member) => (
            <li
              key={member.email}
              className="flex items-center gap-3 rounded-lg px-2 py-2"
            >
              <Avatar className="size-8">
                <AvatarImage src="/placeholder.svg" alt="" />
                <AvatarFallback className="text-xs">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {member.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {member.email}
                </span>
              </div>
              {member.pending ? (
                <Badge variant="outline">Invited</Badge>
              ) : (
                <Badge variant="secondary">{roleLabel[member.role]}</Badge>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
