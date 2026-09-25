"use client";

import * as React from "react";
import { ChevronDownIcon, UserMinusIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Separator } from "@/registry/base/ui/separator";

type Role = "admin" | "editor" | "viewer";

type Member = {
  id: string;
  name: string;
  email: string;
  initials: string;
  image?: string;
  role: Role | "owner";
};

const roles: { value: Role; label: string; description: string }[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Manage billing, members, and every project.",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Create and edit projects, but not settings.",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read and comment. Free on every plan.",
  },
];

const roleLabel: Record<Member["role"], string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const initialMembers: Member[] = [
  {
    id: "m1",
    name: "Sofia Martins",
    email: "sofia@lumen.studio",
    initials: "SM",
    image: "/placeholder.svg",
    role: "owner",
  },
  {
    id: "m2",
    name: "Kwame Asante",
    email: "kwame@lumen.studio",
    initials: "KA",
    role: "admin",
  },
  {
    id: "m3",
    name: "Elena Petrova",
    email: "elena@lumen.studio",
    initials: "EP",
    image: "/placeholder.svg",
    role: "editor",
  },
  {
    id: "m4",
    name: "Noah Brennan",
    email: "noah@freelance.dev",
    initials: "NB",
    role: "viewer",
  },
];

function RolePopover({
  member,
  onRoleChange,
  onRemove,
}: {
  member: Member;
  onRoleChange: (role: Role) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const firstName = member.name.split(" ")[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Change role for ${member.name}, currently ${roleLabel[member.role]}`}
          >
            {roleLabel[member.role]}
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-72 gap-3 p-3">
        <PopoverHeader>
          <PopoverTitle>Role for {firstName}</PopoverTitle>
          <PopoverDescription>Changes apply immediately.</PopoverDescription>
        </PopoverHeader>
        <RadioGroup
          aria-label={`Role for ${member.name}`}
          value={member.role}
          onValueChange={(value) => {
            onRoleChange(value as Role);
            setOpen(false);
          }}
          className="gap-0"
        >
          {roles.map((role) => (
            // biome-ignore lint/a11y/noLabelWithoutControl: the radio renders inside the label
            <label
              key={role.value}
              className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted has-data-checked:bg-muted"
            >
              <RadioGroupItem value={role.value} className="mt-0.5" />
              <span className="grid gap-0.5">
                <span className="font-medium text-sm">{role.label}</span>
                <span className="text-muted-foreground text-xs">
                  {role.description}
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>
        <Separator />
        <Button
          variant="destructive"
          size="sm"
          className="justify-start"
          onClick={() => {
            setOpen(false);
            onRemove();
          }}
        >
          <UserMinusIcon aria-hidden="true" />
          Remove from workspace
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function Popover10() {
  const [members, setMembers] = React.useState(initialMembers);
  const [announcement, setAnnouncement] = React.useState("");

  function changeRole(id: string, role: Role) {
    const member = members.find((item) => item.id === id);
    setMembers((current) =>
      current.map((item) => (item.id === id ? { ...item, role } : item)),
    );
    if (member) {
      setAnnouncement(`${member.name} is now ${roleLabel[role]}.`);
    }
  }

  function removeMember(id: string) {
    const member = members.find((item) => item.id === id);
    setMembers((current) => current.filter((item) => item.id !== id));
    if (member) setAnnouncement(`${member.name} was removed.`);
  }

  return (
    <section
      aria-labelledby="popover-10-heading"
      className="w-full max-w-lg rounded-lg border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h3 id="popover-10-heading" className="font-medium text-sm">
            Members
          </h3>
          <p className="text-muted-foreground text-xs">
            {members.length} of 10 seats used
          </p>
        </div>
        <Button size="sm" variant="outline">
          Invite
        </Button>
      </header>
      <ul className="divide-y">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 px-4 py-2.5">
            <Avatar>
              {member.image ? (
                <AvatarImage src={member.image} alt="" />
              ) : null}
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{member.name}</p>
              <p className="truncate text-muted-foreground text-xs">
                {member.email}
              </p>
            </div>
            {member.role === "owner" ? (
              <span className="px-2.5 text-muted-foreground text-sm">
                Owner
              </span>
            ) : (
              <RolePopover
                member={member}
                onRoleChange={(role) => changeRole(member.id, role)}
                onRemove={() => removeMember(member.id)}
              />
            )}
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
