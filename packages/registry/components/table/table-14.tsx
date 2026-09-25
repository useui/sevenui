"use client";

import { MailIcon, MoreHorizontalIcon, UserPlusIcon } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

type Member = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  status: "active" | "invited";
  invitedAgo?: string;
  owner?: boolean;
};

const initialMembers: Member[] = [
  {
    id: "m1",
    name: "Priya Raman",
    email: "priya@lumen.studio",
    initials: "PR",
    role: "admin",
    status: "active",
    owner: true,
  },
  {
    id: "m2",
    name: "Daniel Okafor",
    email: "daniel@lumen.studio",
    initials: "DO",
    role: "editor",
    status: "active",
  },
  {
    id: "m3",
    name: "Hannah Becker",
    email: "hannah@lumen.studio",
    initials: "HB",
    role: "editor",
    status: "active",
  },
  {
    id: "m4",
    name: "",
    email: "tom.lindqvist@gmail.com",
    initials: "TL",
    role: "viewer",
    status: "invited",
    invitedAgo: "2 days ago",
  },
];

const SEATS = 5;

// Addresses the Invite button sends to, in order, skipping any already on the team.
const pendingInvites = [
  "sofia.marin@lumen.studio",
  "kenji.ito@lumen.studio",
  "amara.osei@lumen.studio",
  "tom.lindqvist@gmail.com",
];

export default function Table14() {
  const [members, setMembers] = React.useState(initialMembers);
  const [notice, setNotice] = React.useState("");

  const update = (id: string, patch: Partial<Member>) =>
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );

  return (
    <div className="w-full max-w-2xl rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="grid gap-1">
          <h3 id="table-14-title" className="font-semibold">
            Members
          </h3>
          <p className="text-sm text-muted-foreground">
            <span className="tabular-nums">
              {members.length} of {SEATS}
            </span>{" "}
            seats used on the Studio plan.
          </p>
        </div>
        <Button
          size="sm"
          disabled={members.length >= SEATS}
          onClick={() => {
            const email = pendingInvites.find(
              (address) => !members.some((m) => m.email === address),
            );
            if (!email) return;
            setMembers((prev) => [
              ...prev,
              {
                id: email,
                name: "",
                email,
                initials: email.slice(0, 2).toUpperCase(),
                role: "viewer",
                status: "invited",
                invitedAgo: "just now",
              },
            ]);
            setNotice(`Invite sent to ${email}.`);
          }}
        >
          <UserPlusIcon aria-hidden="true" data-icon="inline-start" />
          Invite
        </Button>
      </div>
      <Table aria-labelledby="table-14-title">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Member</TableHead>
            <TableHead className="hidden w-32 sm:table-cell">Role</TableHead>
            <TableHead className="w-12 pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const displayName = member.name || member.email;
            // Rendered in the Role column, or under the name on narrow screens.
            const roleSelect = (
              <Select
                items={roles}
                value={member.role}
                disabled={member.owner}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    update(member.id, { role: value });
                    const label = roles.find(
                      (r) => r.value === value,
                    )?.label;
                    setNotice(`${displayName} is now ${label}.`);
                  }
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-28"
                  aria-label={`Role for ${displayName}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
            return (
              <TableRow key={member.id}>
                <TableCell className="py-3 pl-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="hidden sm:flex">
                      {member.status === "active" ? (
                        <AvatarImage src="/placeholder.svg" alt="" />
                      ) : null}
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div className="max-w-48 min-w-0 sm:max-w-none">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {displayName}
                        </span>
                        {member.owner ? (
                          <Badge variant="secondary">Owner</Badge>
                        ) : null}
                        {member.status === "invited" ? (
                          <Badge variant="outline">Pending</Badge>
                        ) : null}
                      </div>
                      {member.name ? (
                        <div className="truncate text-xs text-muted-foreground">
                          {member.email}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Invite sent {member.invitedAgo}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:hidden">{roleSelect}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {roleSelect}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  {member.owner ? null : (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${displayName}`}
                          >
                            <MoreHorizontalIcon aria-hidden="true" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        {member.status === "invited" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              setNotice(`Invite resent to ${member.email}.`)
                            }
                          >
                            <MailIcon aria-hidden="true" />
                            Resend invite
                          </DropdownMenuItem>
                        ) : null}
                        {member.status === "invited" ? (
                          <DropdownMenuSeparator />
                        ) : null}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            setMembers((prev) =>
                              prev.filter((m) => m.id !== member.id),
                            );
                            setNotice(
                              member.status === "invited"
                                ? `Invite for ${member.email} revoked.`
                                : `${displayName} was removed.`,
                            );
                          }}
                        >
                          {member.status === "invited"
                            ? "Revoke invite"
                            : "Remove from team"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p
        aria-live="polite"
        className="min-h-10 border-t px-4 py-2.5 text-xs text-muted-foreground"
      >
        {notice || "Admins can manage billing and invite new members."}
      </p>
    </div>
  );
}
