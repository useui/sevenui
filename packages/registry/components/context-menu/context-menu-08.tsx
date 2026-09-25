"use client";

import { Copy, Mail, ShieldCheck, UserMinus } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type Role = "Owner" | "Admin" | "Member" | "Viewer";

type Member = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
  pending: boolean;
};

const roles: { value: Role; description: string }[] = [
  { value: "Admin", description: "Billing and members" },
  { value: "Member", description: "Create and edit projects" },
  { value: "Viewer", description: "Read-only access" },
];

const initialMembers: Member[] = [
  {
    id: "maya",
    name: "Maya Chen",
    email: "maya@northwind.io",
    initials: "MC",
    role: "Owner",
    pending: false,
  },
  {
    id: "jonas",
    name: "Jonas Weber",
    email: "jonas@northwind.io",
    initials: "JW",
    role: "Admin",
    pending: false,
  },
  {
    id: "priya",
    name: "Priya Raman",
    email: "priya@northwind.io",
    initials: "PR",
    role: "Member",
    pending: false,
  },
  {
    id: "leo",
    name: "Leo Martins",
    email: "leo@contractor.dev",
    initials: "LM",
    role: "Viewer",
    pending: true,
  },
];

export default function ContextMenu08() {
  const [members, setMembers] = React.useState(initialMembers);
  const [notice, setNotice] = React.useState("");

  function setRole(id: string, role: Role) {
    setMembers((current) =>
      current.map((member) =>
        member.id === id ? { ...member, role } : member,
      ),
    );
  }

  return (
    <section
      aria-labelledby="context-menu-08-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="border-b px-4 py-3">
        <h3 id="context-menu-08-title" className="text-sm font-semibold">
          Team members
        </h3>
        <p className="text-xs text-muted-foreground">
          Right-click a member to change their role or access.
        </p>
      </header>
      <ul className="divide-y">
        {members.map((member) => {
          const isOwner = member.role === "Owner";
          return (
            <li key={member.id}>
              <ContextMenu>
                <ContextMenuTrigger
                  onKeyDown={openMenuWithShiftF10}
                  tabIndex={0}
                  aria-label={`${member.name}, ${member.role}${member.pending ? ", invitation pending" : ""}`}
                  className="flex items-center gap-3 px-4 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset data-popup-open:bg-muted/60"
                >
                  <Avatar>
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                  {member.pending ? (
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      Invited
                    </Badge>
                  ) : null}
                  <Badge variant={isOwner ? "default" : "secondary"}>
                    {member.role}
                  </Badge>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-60">
                  <ContextMenuGroup>
                    <ContextMenuLabel className="truncate">
                      {member.name}
                    </ContextMenuLabel>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger disabled={isOwner}>
                        <ShieldCheck aria-hidden="true" />
                        Change role
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-56">
                        <ContextMenuRadioGroup
                          value={member.role}
                          onValueChange={(value) => {
                            setRole(member.id, value as Role);
                            setNotice(`${member.name} is now ${value}.`);
                          }}
                        >
                          {roles.map((role) => (
                            <ContextMenuRadioItem
                              key={role.value}
                              value={role.value}
                            >
                              <span className="flex flex-col">
                                <span>{role.value}</span>
                                <span className="text-xs text-muted-foreground">
                                  {role.description}
                                </span>
                              </span>
                            </ContextMenuRadioItem>
                          ))}
                        </ContextMenuRadioGroup>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem
                      onClick={() => {
                        void navigator.clipboard
                          ?.writeText(member.email)
                          .catch(() => {});
                        setNotice(`Copied ${member.email} to clipboard.`);
                      }}
                    >
                      <Copy aria-hidden="true" />
                      Copy email
                    </ContextMenuItem>
                    {member.pending ? (
                      <ContextMenuItem
                        onClick={() =>
                          setNotice(`Invitation resent to ${member.email}.`)
                        }
                      >
                        <Mail aria-hidden="true" />
                        Resend invitation
                      </ContextMenuItem>
                    ) : null}
                  </ContextMenuGroup>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="destructive"
                    disabled={isOwner}
                    onClick={() => {
                      setMembers((current) =>
                        current.filter((item) => item.id !== member.id),
                      );
                      setNotice(`${member.name} was removed from the team.`);
                    }}
                  >
                    <UserMinus aria-hidden="true" />
                    {member.pending ? "Revoke invitation" : "Remove from team"}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </li>
          );
        })}
      </ul>
      <footer
        aria-live="polite"
        className="min-h-10 border-t px-4 py-2.5 text-xs text-muted-foreground"
      >
        {notice || "Owners can't be demoted or removed."}
      </footer>
    </section>
  );
}
