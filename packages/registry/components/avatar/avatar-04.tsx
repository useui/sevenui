"use client";

import { BadgeCheck, Crown, Moon } from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";

const presence = [
  {
    name: "Elena Petrova",
    initials: "EP",
    status: "Online",
    detail: "Active now",
    badge: "bg-success",
  },
  {
    name: "Tomás Ferreira",
    initials: "TF",
    status: "Away",
    detail: "Back at 2:30 PM",
    badge: "bg-warning",
  },
  {
    name: "Aisha Rahman",
    initials: "AR",
    status: "Do not disturb",
    detail: "Focus time until 4:00 PM",
    badge: "bg-destructive",
  },
  {
    name: "Jonas Weber",
    initials: "JW",
    status: "Offline",
    detail: "Last seen 2 hours ago",
    badge: "bg-muted-foreground",
  },
];

const iconBadge =
  "group-data-[size=lg]/avatar:size-4 group-data-[size=lg]/avatar:[&>svg]:size-3";

export default function Avatar04() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {presence.map((person) => (
          <li key={person.name} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt="" />
              <AvatarFallback>{person.initials}</AvatarFallback>
              <AvatarBadge aria-hidden="true" className={person.badge} />
            </Avatar>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{person.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                <span className="text-foreground">{person.status}</span> ·{" "}
                {person.detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-5 border-t border-border pt-4">
        <Avatar size="lg">
          <AvatarFallback>KM</AvatarFallback>
          <AvatarBadge role="img" aria-label="Verified" className={iconBadge}>
            <BadgeCheck aria-hidden="true" />
          </AvatarBadge>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>LB</AvatarFallback>
          <AvatarBadge
            role="img"
            aria-label="Workspace owner"
            className={`bg-warning text-warning-foreground ${iconBadge}`}
          >
            <Crown aria-hidden="true" />
          </AvatarBadge>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>NS</AvatarFallback>
          <AvatarBadge
            role="img"
            aria-label="Notifications paused"
            className={`bg-secondary text-secondary-foreground ${iconBadge}`}
          >
            <Moon aria-hidden="true" />
          </AvatarBadge>
        </Avatar>
        <p className="text-xs text-muted-foreground">
          Icon badges for verified, owner, and snoozed accounts.
        </p>
      </div>
    </div>
  );
}
