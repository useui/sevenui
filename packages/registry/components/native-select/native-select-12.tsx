"use client";

import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

type Role = "owner" | "admin" | "member" | "viewer";

type Member = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
  pending?: boolean;
};

const roles: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

const initialMembers: Member[] = [
  {
    id: "m1",
    name: "Priya Raman",
    email: "priya@northwind.io",
    initials: "PR",
    role: "owner",
  },
  {
    id: "m2",
    name: "Daniel Okafor",
    email: "daniel@northwind.io",
    initials: "DO",
    role: "admin",
  },
  {
    id: "m3",
    name: "Sofia Lindqvist",
    email: "sofia@northwind.io",
    initials: "SL",
    role: "member",
  },
  {
    id: "m4",
    name: "marcus@contractor.dev",
    email: "Invitation sent 2 days ago",
    initials: "M",
    role: "viewer",
    pending: true,
  },
];

export default function NativeSelect12() {
  const [members, setMembers] = React.useState(initialMembers);

  const admins = members.filter(
    (member) => member.role === "owner" || member.role === "admin",
  ).length;

  return (
    <section
      aria-labelledby="native-select-12-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <div className="grid gap-1 p-4">
        <h3 id="native-select-12-title" className="text-base font-medium">
          Workspace members
        </h3>
        <p className="text-sm text-muted-foreground">
          {members.length} people · {admins} can manage billing and settings
        </p>
      </div>
      <ul className="divide-y border-t">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="hidden sm:flex">
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 gap-0.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {member.name}
                </span>
                {member.pending ? (
                  <Badge variant="outline" className="shrink-0">
                    Invited
                  </Badge>
                ) : null}
              </div>
              <span className="truncate text-sm text-muted-foreground">
                {member.email}
              </span>
            </div>
            {member.role === "owner" ? (
              <span className="shrink-0 px-2.5 text-sm text-muted-foreground">
                Owner
              </span>
            ) : (
              <NativeSelect
                size="sm"
                className="shrink-0"
                aria-label={`Role for ${member.name}`}
                value={member.role}
                onChange={(event) => {
                  const role = event.target.value as Role;
                  setMembers((current) =>
                    current.map((item) =>
                      item.id === member.id ? { ...item, role } : item,
                    ),
                  );
                }}
              >
                {roles.map((role) => (
                  <NativeSelectOption key={role.value} value={role.value}>
                    {role.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
