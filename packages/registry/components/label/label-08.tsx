"use client";

import * as React from "react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";

const channels = ["Email", "Push", "SMS"] as const;

type Channel = (typeof channels)[number];

const events = [
  {
    id: "mentions",
    name: "Mentions",
    hint: "Someone @mentions you in a comment",
    defaults: ["Email", "Push"],
  },
  {
    id: "assigned",
    name: "Assigned to you",
    hint: "A ticket lands in your queue",
    defaults: ["Email", "Push", "SMS"],
  },
  {
    id: "status",
    name: "Status changes",
    hint: "Tickets you follow move columns",
    defaults: ["Push"],
  },
  {
    id: "digest",
    name: "Weekly digest",
    hint: "Monday summary of your team",
    defaults: ["Email"],
  },
] satisfies { id: string; name: string; hint: string; defaults: Channel[] }[];

export default function Label08() {
  const [matrix, setMatrix] = React.useState<Record<string, Channel[]>>(() =>
    Object.fromEntries(events.map((event) => [event.id, event.defaults])),
  );

  function toggle(eventId: string, channel: Channel, checked: boolean) {
    setMatrix((current) => {
      const selected = current[eventId] ?? [];
      return {
        ...current,
        [eventId]: checked
          ? [...selected, channel]
          : selected.filter((item) => item !== channel),
      };
    });
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex flex-col gap-1 border-b border-border p-3 sm:p-4">
        <h3 className="text-base font-semibold">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose where each kind of update reaches you.
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="p-2 pl-3 text-left font-medium text-muted-foreground sm:p-3 sm:pl-4">
              <span className="sr-only">Event</span>
            </th>
            {channels.map((channel) => (
              <th
                key={channel}
                scope="col"
                className="w-10 px-1 py-3 text-center text-xs font-medium text-muted-foreground sm:w-16 sm:p-3"
              >
                {channel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-border last:border-0">
              <th scope="row" className="p-2 pl-3 text-left font-normal wrap-break-word sm:p-3 sm:pl-4">
                <span className="block font-medium">{event.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {event.hint}
                </span>
              </th>
              {channels.map((channel) => (
                <td key={channel} className="p-0 text-center">
                  <Label className="flex h-full min-h-14 cursor-pointer items-center justify-center hover:bg-muted/60">
                    <Checkbox
                      checked={matrix[event.id]?.includes(channel) ?? false}
                      onCheckedChange={(checked) =>
                        toggle(event.id, channel, checked)
                      }
                    />
                    <span className="sr-only">
                      {channel} for {event.name}
                    </span>
                  </Label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
