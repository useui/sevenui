"use client";

import * as React from "react";
import { UserMinus } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/registry/base/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  projects: number;
};

const initialMembers: Member[] = [
  {
    id: "m-1",
    name: "Priya Raman",
    email: "priya@northwind.io",
    role: "Owner",
    projects: 12,
  },
  {
    id: "m-2",
    name: "Daniel Okafor",
    email: "daniel@northwind.io",
    role: "Admin",
    projects: 7,
  },
  {
    id: "m-3",
    name: "Lena Fischer",
    email: "lena@northwind.io",
    role: "Member",
    projects: 3,
  },
  {
    id: "m-4",
    name: "Marco Silva",
    email: "marco@northwind.io",
    role: "Member",
    projects: 1,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function AlertDialog07() {
  const [members, setMembers] = React.useState(initialMembers);
  const [open, setOpen] = React.useState(false);
  // Kept after close so the popup content does not blank out mid exit-animation.
  const [target, setTarget] = React.useState<Member | null>(null);

  const requestRemoval = (member: Member) => {
    setTarget(member);
    setOpen(true);
  };

  const confirmRemoval = () => {
    if (!target) return;
    setMembers((current) => current.filter((m) => m.id !== target.id));
  };

  return (
    <section
      aria-labelledby="alert-dialog-07-heading"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between gap-4 border-b px-4 py-3">
        <h3 id="alert-dialog-07-heading" className="text-sm font-medium">
          Team members
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {members.length} of 10 seats
        </span>
      </header>
      <ul className="divide-y">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar>
              <AvatarFallback>{initials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-sm font-medium">{member.name}</p>
                {member.role !== "Member" ? (
                  <Badge variant="secondary">{member.role}</Badge>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {member.email}
              </p>
            </div>
            {member.role === "Owner" ? (
              <span className="text-xs text-muted-foreground">You</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => requestRemoval(member)}
                aria-label={`Remove ${member.name}`}
              >
                Remove
              </Button>
            )}
          </li>
        ))}
      </ul>
      {members.length < initialMembers.length ? (
        <div className="flex items-center justify-between gap-4 border-t px-4 py-2">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {initialMembers.length - members.length} removed
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMembers(initialMembers)}
          >
            Restore members
          </Button>
        </div>
      ) : null}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <UserMinus aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Remove {target?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They lose access to the Northwind workspace right away. Their{" "}
              {target?.projects === 1
                ? "project moves"
                : `${target?.projects} projects move`}{" "}
              to you, and the seat is freed on your next invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep member</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmRemoval}>
              Remove from team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
