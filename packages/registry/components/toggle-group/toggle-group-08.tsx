"use client";

import * as React from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const channels = [
  { value: "email", label: "Email", icon: Mail },
  { value: "push", label: "Push", icon: Bell },
  { value: "slack", label: "Slack", icon: MessageSquare },
];

const events = [
  {
    id: "mentions",
    title: "Mentions",
    description: "Someone @mentions you in a comment.",
    defaults: ["email", "push", "slack"],
  },
  {
    id: "assigned",
    title: "Assigned to you",
    description: "An issue or review lands on your plate.",
    defaults: ["push", "slack"],
  },
  {
    id: "deploys",
    title: "Failed deploys",
    description: "A production deploy you triggered fails.",
    defaults: ["email", "push"],
  },
  {
    id: "digest",
    title: "Weekly digest",
    description: "A Monday summary of activity in your projects.",
    defaults: ["email"],
  },
];

export default function ToggleGroup08() {
  const [prefs, setPrefs] = React.useState<Record<string, string[]>>(() =>
    Object.fromEntries(events.map((event) => [event.id, event.defaults])),
  );

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Pick where each kind of update reaches you.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {events.map((event) => {
          const selected = prefs[event.id] ?? [];
          return (
            <div
              key={event.id}
              className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span id={`toggle-group-08-${event.id}`} className="text-sm font-medium">
                  {event.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selected.length === 0 ? "Muted. " : ""}
                  {event.description}
                </span>
              </div>
              <ToggleGroup
                multiple
                size="sm"
                variant="outline"
                spacing={1}
                className="shrink-0"
                aria-labelledby={`toggle-group-08-${event.id}`}
                value={selected}
                onValueChange={(next) =>
                  setPrefs((current) => ({ ...current, [event.id]: next }))
                }
              >
                {channels.map((channel) => (
                  <ToggleGroupItem
                    key={channel.value}
                    value={channel.value}
                    className="aria-pressed:border-primary/40 aria-pressed:bg-primary/10 aria-pressed:text-primary"
                  >
                    <channel.icon aria-hidden="true" />
                    {channel.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
