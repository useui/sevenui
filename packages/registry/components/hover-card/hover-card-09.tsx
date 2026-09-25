"use client";

import { ClockIcon, EyeIcon, FileTextIcon, MailIcon } from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

type Collaborator = {
  name: string;
  initials: string;
  email: string;
  title: string;
  access: "Owner" | "Can edit" | "Can comment";
  localTime: string;
  timezone: string;
  activity: string;
  online: boolean;
};

const collaborators: Collaborator[] = [
  {
    name: "Elena Novak",
    initials: "EN",
    email: "elena@northwind.io",
    title: "Head of Product",
    access: "Owner",
    localTime: "4:12 PM",
    timezone: "Berlin",
    activity: "Editing section 3 now",
    online: true,
  },
  {
    name: "Daniel Okafor",
    initials: "DO",
    email: "daniel@northwind.io",
    title: "Staff Engineer",
    access: "Can edit",
    localTime: "3:12 PM",
    timezone: "Lagos",
    activity: "Viewed 20 minutes ago",
    online: true,
  },
  {
    name: "Sofia Martins",
    initials: "SM",
    email: "sofia@northwind.io",
    title: "Product Designer",
    access: "Can comment",
    localTime: "11:12 AM",
    timezone: "São Paulo",
    activity: "Left 4 comments yesterday",
    online: false,
  },
];

const hiddenCount = 4;

function CollaboratorAvatar({ person }: { person: Collaborator }) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={200}
        render={
          <button
            type="button"
            aria-label={`${person.name}, ${person.access.toLowerCase()}`}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          />
        }
      >
        <Avatar className="ring-2 ring-card">
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback>{person.initials}</AvatarFallback>
          {person.online && <AvatarBadge className="bg-success ring-card" />}
        </Avatar>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        className="w-72 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-start gap-3 p-3">
          <Avatar size="lg">
            <AvatarImage src="/placeholder.svg" alt="" />
            <AvatarFallback>{person.initials}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 gap-0.5">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{person.name}</p>
              <Badge
                variant={person.access === "Owner" ? "default" : "secondary"}
              >
                {person.access}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {person.title}
            </p>
          </div>
        </div>
        <ul className="grid gap-2 border-t px-3 py-2.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <MailIcon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{person.email}</span>
          </li>
          <li className="flex items-center gap-2">
            <ClockIcon aria-hidden="true" className="size-3.5 shrink-0" />
            <span>
              <span className="text-foreground tabular-nums">
                {person.localTime}
              </span>{" "}
              local time in {person.timezone}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <EyeIcon aria-hidden="true" className="size-3.5 shrink-0" />
            <span className={person.online ? "text-foreground" : undefined}>
              {person.activity}
            </span>
          </li>
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCard09() {
  return (
    <div className="flex w-full max-w-md flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-card-foreground">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <FileTextIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Q4 Pricing Proposal</p>
          <p className="truncate text-xs text-muted-foreground">
            Edited 2 minutes ago
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AvatarGroup role="group" aria-label="Shared with">
          {collaborators.map((person) => (
            <CollaboratorAvatar key={person.email} person={person} />
          ))}
          <AvatarGroupCount className="text-xs ring-card">
            <span aria-hidden="true">+{hiddenCount}</span>
            <span className="sr-only">and {hiddenCount} more people</span>
          </AvatarGroupCount>
        </AvatarGroup>
      </div>
    </div>
  );
}
