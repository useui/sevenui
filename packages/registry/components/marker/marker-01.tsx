"use client";

import {
  PencilLineIcon,
  PinIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "lucide-react";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

const events = [
  {
    id: "joined",
    icon: UserPlusIcon,
    actor: "Maya Chen",
    action: "joined #design\u2011reviews",
    time: "9:12 AM",
    dateTime: "09:12",
  },
  {
    id: "renamed",
    icon: PencilLineIcon,
    actor: "Jordan Park",
    action: "renamed the channel from #ui\u2011crit",
    time: "9:20 AM",
    dateTime: "09:20",
  },
  {
    id: "pinned",
    icon: PinIcon,
    actor: "Maya Chen",
    action: "pinned “Q4 navigation audit”",
    time: "10:04 AM",
    dateTime: "10:04",
  },
  {
    id: "left",
    icon: UserMinusIcon,
    actor: "Sam Ortiz",
    action: "left the channel",
    time: "11:37 AM",
    dateTime: "11:37",
  },
];

export default function Marker01() {
  return (
    <ul
      aria-label="Channel activity"
      className="flex w-full max-w-sm flex-col gap-3"
    >
      {events.map((event) => (
        <li key={event.id}>
          <Marker>
            <MarkerIcon>
              <event.icon />
            </MarkerIcon>
            <MarkerContent className="flex-1">
              <span className="font-medium text-foreground">
                {event.actor}
              </span>{" "}
              {event.action}
            </MarkerContent>
            <time
              dateTime={event.dateTime}
              className="shrink-0 text-xs tabular-nums"
            >
              {event.time}
            </time>
          </Marker>
        </li>
      ))}
    </ul>
  );
}
