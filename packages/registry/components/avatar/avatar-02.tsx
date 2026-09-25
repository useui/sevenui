"use client";

import { Bot, CalendarDays, Webhook } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";

const people = [
  { name: "Daniel Okafor", initials: "DO" },
  { name: "Sofia Marchetti", initials: "SM" },
];

const workspaces = [
  { name: "Northwind Labs", initials: "NL" },
  { name: "Acme Studio", initials: "AS" },
];

const apps = [
  { name: "Deploy webhook", icon: Webhook },
  { name: "Calendar sync", icon: CalendarDays },
  { name: "Release bot", icon: Bot },
];

export default function Avatar02() {
  return (
    <div className="grid w-full max-w-lg gap-6 sm:grid-cols-3">
      <section className="flex flex-col gap-3">
        <div className="flex gap-2">
          {people.map((person) => (
            <Avatar key={person.name} size="lg">
              <AvatarImage src="/placeholder.svg" alt={person.name} />
              <AvatarFallback>{person.initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-medium">Circle</h3>
          <p className="text-xs text-muted-foreground">People and members</p>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex gap-2">
          {workspaces.map((workspace, index) => (
            <Avatar
              key={workspace.name}
              size="lg"
              role="img"
              aria-label={workspace.name}
              className="rounded-xl after:rounded-xl"
            >
              <AvatarFallback
                className={
                  index === 0
                    ? "rounded-xl bg-primary font-medium text-primary-foreground"
                    : "rounded-xl bg-secondary font-medium text-secondary-foreground"
                }
              >
                {workspace.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-medium">Rounded</h3>
          <p className="text-xs text-muted-foreground">Teams and workspaces</p>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex gap-2">
          {apps.map((app) => (
            <Avatar
              key={app.name}
              size="lg"
              role="img"
              aria-label={app.name}
              className="rounded-md after:rounded-md"
            >
              <AvatarFallback
                className="rounded-md bg-muted text-foreground"
              >
                <app.icon aria-hidden="true" className="size-5" />
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-medium">Square</h3>
          <p className="text-xs text-muted-foreground">Apps and bots</p>
        </div>
      </section>
    </div>
  );
}
