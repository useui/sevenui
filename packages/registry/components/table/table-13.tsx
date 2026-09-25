"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const channels = [
  { key: "email", label: "Email" },
  { key: "push", label: "Push" },
  { key: "slack", label: "Slack" },
] as const;

type Channel = (typeof channels)[number]["key"];
type Prefs = Record<string, Record<Channel, boolean>>;

const groups = [
  {
    title: "Projects",
    events: [
      {
        id: "mention",
        label: "Someone mentions you",
        hint: "In comments and task descriptions",
      },
      { id: "assigned", label: "A task is assigned to you" },
      { id: "due", label: "A task you own is due tomorrow" },
    ],
  },
  {
    title: "Account",
    events: [
      { id: "login", label: "New sign-in from an unknown device" },
      { id: "billing", label: "Payment failed or card expiring" },
    ],
  },
];

const defaults: Prefs = {
  mention: { email: true, push: true, slack: true },
  assigned: { email: true, push: false, slack: true },
  due: { email: false, push: true, slack: false },
  login: { email: true, push: true, slack: false },
  billing: { email: true, push: false, slack: false },
};

const eventIds = Object.keys(defaults);

// Security alerts cannot be switched off for email.
const isLocked = (id: string, channel: Channel) =>
  id === "login" && channel === "email";

export default function Table13() {
  const [prefs, setPrefs] = React.useState<Prefs>(defaults);
  const [saved, setSaved] = React.useState<Prefs>(defaults);

  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved);

  const toggle = (id: string, channel: Channel, value: boolean) =>
    setPrefs((prev) => ({ ...prev, [id]: { ...prev[id], [channel]: value } }));

  const setColumn = (channel: Channel, value: boolean) =>
    setPrefs((prev) => {
      const next = { ...prev };
      for (const id of eventIds) {
        next[id] = { ...next[id], [channel]: isLocked(id, channel) || value };
      }
      return next;
    });

  return (
    <div className="w-full max-w-xl rounded-xl border bg-card text-card-foreground">
      <div className="grid gap-1 px-4 pt-4 pb-2">
        <h3 id="table-13-title" className="font-semibold">
          Notifications
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose where each alert reaches you. Security alerts always go to
          email.
        </p>
      </div>
      <Table aria-labelledby="table-13-title">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Event</TableHead>
            {channels.map((channel) => {
              const on = eventIds.filter((id) => prefs[id][channel.key]).length;
              return (
                <TableHead
                  key={channel.key}
                  className="w-12 px-1 text-center last:pr-2! sm:w-16 sm:px-2"
                >
                  <div className="flex flex-col items-center gap-1.5 py-2">
                    <span>{channel.label}</span>
                    <Checkbox
                      aria-label={`Toggle all ${channel.label} notifications`}
                      checked={on === eventIds.length}
                      indeterminate={on > 0 && on < eventIds.length}
                      onCheckedChange={(value) => setColumn(channel.key, value)}
                    />
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        {groups.map((group) => (
          <TableBody key={group.title}>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead
                scope="colgroup"
                colSpan={channels.length + 1}
                className="h-8 pl-4 text-xs font-medium text-muted-foreground"
              >
                {group.title}
              </TableHead>
            </TableRow>
            {group.events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="py-3 pl-4 whitespace-normal">
                  <div className="font-medium">{event.label}</div>
                  {"hint" in event && event.hint ? (
                    <div className="text-xs text-muted-foreground">
                      {event.hint}
                    </div>
                  ) : null}
                </TableCell>
                {channels.map((channel) => {
                  const locked = isLocked(event.id, channel.key);
                  return (
                    <TableCell
                      key={channel.key}
                      className="px-1 text-center last:pr-2! sm:px-2"
                    >
                      <Checkbox
                        className="mx-auto"
                        aria-label={`${channel.label}: ${event.label}`}
                        checked={prefs[event.id][channel.key]}
                        disabled={locked}
                        onCheckedChange={(value) =>
                          toggle(event.id, channel.key, value)
                        }
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        ))}
      </Table>
      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <span
          aria-live="polite"
          className="mr-auto text-xs text-muted-foreground"
        >
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={!dirty}
          onClick={() => setPrefs(saved)}
        >
          Discard
        </Button>
        <Button size="sm" disabled={!dirty} onClick={() => setSaved(prefs)}>
          Save
        </Button>
      </div>
    </div>
  );
}
