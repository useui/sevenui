"use client";

import * as React from "react";
import { ChevronDownIcon, MailIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Input } from "@/registry/base/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/base/ui/item";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
] as const;

type Role = (typeof ROLES)[number]["value"];

type Member = {
  email: string;
  name: string | null;
  initials: string;
  role: Role;
  isYou?: boolean;
};

const INITIAL_MEMBERS: Member[] = [
  {
    email: "amara.okafor@lumen.studio",
    name: "Amara Okafor",
    initials: "AO",
    role: "admin",
    isYou: true,
  },
  {
    email: "theo.lindqvist@lumen.studio",
    name: "Theo Lindqvist",
    initials: "TL",
    role: "editor",
  },
  {
    email: "rosa.mendez@lumen.studio",
    name: null,
    initials: "RM",
    role: "viewer",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Item13() {
  const id = React.useId();
  const [members, setMembers] = React.useState<Member[]>(INITIAL_MEMBERS);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like sam@company.com.");
      return;
    }
    if (members.some((m) => m.email === value)) {
      setError("That person is already on the team or invited.");
      return;
    }
    setMembers((prev) => [
      ...prev,
      {
        email: value,
        name: null,
        initials: value.slice(0, 2).toUpperCase(),
        role: "editor",
      },
    ]);
    setEmail("");
    setError(null);
  }

  function setRole(target: string, role: Role) {
    setMembers((prev) =>
      prev.map((m) => (m.email === target ? { ...m, role } : m)),
    );
  }

  function remove(target: string) {
    setMembers((prev) => prev.filter((m) => m.email !== target));
  }

  return (
    <div className="w-full max-w-lg rounded-xl border bg-card text-card-foreground">
      <form onSubmit={invite} noValidate className="space-y-2 border-b p-4">
        <label htmlFor={`${id}-email`} className="text-sm font-medium">
          Invite teammates
        </label>
        <div className="flex gap-2">
          <Input
            id={`${id}-email`}
            type="email"
            placeholder="name@lumen.studio"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <Button type="submit">Invite</Button>
        </div>
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      <ItemGroup className="gap-0 p-1.5" aria-label="Team members">
        {members.map((member, index) => {
          const pending = member.name === null;
          const roleLabel =
            ROLES.find((r) => r.value === member.role)?.label ?? "";
          return (
            <React.Fragment key={member.email}>
              {index > 0 && <ItemSeparator className="mx-3 my-0 data-[orientation=horizontal]:w-auto" />}
              <Item role="listitem" size="sm">
                <ItemMedia>
                  {pending ? (
                    <span className="flex size-8 items-center justify-center rounded-full border border-dashed text-muted-foreground">
                      <MailIcon aria-hidden="true" className="size-3.5" />
                    </span>
                  ) : (
                    <Avatar>
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                  )}
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="w-full flex-wrap gap-y-1">
                    <span className="min-w-0 truncate">
                      {member.name ?? member.email}
                    </span>
                    {member.isYou && (
                      <span className="shrink-0 text-muted-foreground">(you)</span>
                    )}
                    {pending && <Badge variant="outline">Invited</Badge>}
                  </ItemTitle>
                  <ItemDescription className="truncate">
                    {pending
                      ? "Invitation sent · expires in 7 days"
                      : member.email}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {member.isYou ? (
                    <span className="px-2.5 text-sm text-muted-foreground">
                      {roleLabel}
                    </span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Role for ${member.name ?? member.email}: ${roleLabel}`}
                          >
                            {roleLabel}
                            <ChevronDownIcon
                              aria-hidden="true"
                              data-icon="inline-end"
                            />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuRadioGroup
                          value={member.role}
                          onValueChange={(value) =>
                            setRole(member.email, value as Role)
                          }
                        >
                          {ROLES.map((role) => (
                            <DropdownMenuRadioItem
                              key={role.value}
                              value={role.value}
                              closeOnClick
                            >
                              {role.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => remove(member.email)}
                        >
                          {pending ? "Revoke invite" : "Remove from team"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </ItemActions>
              </Item>
            </React.Fragment>
          );
        })}
      </ItemGroup>
    </div>
  );
}
