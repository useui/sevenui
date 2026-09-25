"use client";

import * as React from "react";

import { ChevronRightIcon, MailIcon, RotateCwIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

const members = [
  { name: "Maya Thompson", email: "maya@northwind.io", role: "Owner" },
  { name: "Daniel Brooks", email: "daniel@northwind.io", role: "Admin" },
  { name: "Priya Shah", email: "priya@northwind.io", role: "Member" },
];

const initialInvites = [
  { email: "leo.martin@northwind.io", role: "Member", sent: "2 days ago" },
  { email: "hannah@studio-fold.com", role: "Guest", sent: "5 days ago" },
  { email: "sam.okafor@northwind.io", role: "Admin", sent: "Expired" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Collapsible09() {
  const [invites, setInvites] = React.useState(initialInvites);
  const [resent, setResent] = React.useState<string[]>([]);

  return (
    <section
      aria-labelledby="collapsible-09-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-3 p-4">
        <div className="flex flex-col gap-0.5">
          <h3 id="collapsible-09-title" className="font-semibold">
            Workspace members
          </h3>
          <p className="text-sm text-muted-foreground">
            {members.length} of 10 seats used
          </p>
        </div>
        <Button size="sm">Invite</Button>
      </header>

      <ul className="flex flex-col border-t">
        {members.map((member) => (
          <li
            key={member.email}
            className="flex items-center gap-3 border-b px-4 py-3"
          >
            <Avatar>
              <AvatarFallback>{initials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">
                {member.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {member.email}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{member.role}</span>
          </li>
        ))}
      </ul>

      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-b-xl px-4 py-3 text-left text-sm font-medium outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 data-panel-open:rounded-none">
          <ChevronRightIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-data-panel-open:rotate-90"
          />
          <span className="flex-1">Pending invitations</span>
          <Badge variant="secondary" className="tabular-nums">
            {invites.length}
          </Badge>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {invites.length === 0 && (
            <p className="px-4 pb-4 text-sm text-muted-foreground">
              No pending invitations. Everyone you invited has joined.
            </p>
          )}
          <ul className="flex flex-col gap-1 px-2 pb-2 empty:hidden">
            {invites.map((invite) => {
              const expired = invite.sent === "Expired";
              const wasResent = resent.includes(invite.email);
              return (
                <li
                  key={invite.email}
                  className="flex items-center gap-3 rounded-lg bg-muted/40 px-2 py-2"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed text-muted-foreground">
                    <MailIcon aria-hidden="true" className="size-3.5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm">{invite.email}</span>
                    <span
                      className={
                        expired && !wasResent
                          ? "text-xs text-destructive"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {invite.role} ·{" "}
                      {wasResent
                        ? "Sent just now"
                        : expired
                          ? "Invitation expired"
                          : `Sent ${invite.sent}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={wasResent}
                    aria-label={`Resend invitation to ${invite.email}`}
                    onClick={() =>
                      setResent((current) => [...current, invite.email])
                    }
                  >
                    <RotateCwIcon aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Revoke invitation to ${invite.email}`}
                    onClick={() =>
                      setInvites((current) =>
                        current.filter((item) => item.email !== invite.email),
                      )
                    }
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
