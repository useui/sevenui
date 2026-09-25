"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import {
  Avatar,
  AvatarFallback,
} from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";

const members = [
  {
    value: "maya",
    name: "Maya Chen",
    initials: "MC",
    title: "Engineering Manager",
    role: "Admin",
    email: "maya.chen@northwind.io",
    timezone: "San Francisco, UTC−7",
    lastActive: "5 minutes ago",
  },
  {
    value: "daniel",
    name: "Daniel Okafor",
    initials: "DO",
    title: "Senior Frontend Engineer",
    role: "Editor",
    email: "daniel.okafor@northwind.io",
    timezone: "Lagos, UTC+1",
    lastActive: "2 hours ago",
  },
  {
    value: "sofia",
    name: "Sofia Lindqvist",
    initials: "SL",
    title: "Product Designer",
    role: "Editor",
    email: "sofia.lindqvist@northwind.io",
    timezone: "Stockholm, UTC+2",
    lastActive: "Yesterday",
  },
  {
    value: "arjun",
    name: "Arjun Mehta",
    initials: "AM",
    title: "Finance Partner",
    role: "Viewer",
    email: "arjun.mehta@northwind.io",
    timezone: "Bengaluru, UTC+5:30",
    lastActive: "3 days ago",
  },
];

export default function Accordion08() {
  return (
    <Accordion className="w-full max-w-md rounded-xl border bg-card">
      {members.map((member) => (
        <AccordionItem key={member.value} value={member.value}>
          <AccordionTrigger className="items-center gap-3 rounded-none px-4 py-3 hover:no-underline">
            <Avatar>
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{member.name}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {member.title}
              </span>
            </span>
            <Badge
              variant={member.role === "Admin" ? "default" : "outline"}
              className="mr-1"
            >
              {member.role}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pl-15">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate">{member.email}</dd>
              <dt className="text-muted-foreground">Local time</dt>
              <dd>{member.timezone}</dd>
              <dt className="text-muted-foreground">Last active</dt>
              <dd>{member.lastActive}</dd>
            </dl>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
