"use client";

import * as React from "react";
import {
  AtSignIcon,
  GitMergeIcon,
  HeartIcon,
  MessageSquareIcon,
  UserPlusIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";

const kinds = {
  mention: { icon: AtSignIcon, label: "Mention", tone: "bg-chart-1" },
  comment: { icon: MessageSquareIcon, label: "Comment", tone: "bg-chart-2" },
  merge: { icon: GitMergeIcon, label: "Merged", tone: "bg-chart-4" },
  like: { icon: HeartIcon, label: "Reaction", tone: "bg-destructive" },
  join: { icon: UserPlusIcon, label: "New member", tone: "bg-success" },
} as const;

const initialNotifications = [
  {
    id: 1,
    kind: "mention" as const,
    actor: "Nadia Haddad",
    initials: "NH",
    image: "/placeholder.svg",
    text: "mentioned you in Q3 pricing review",
    time: "4m",
    unread: true,
  },
  {
    id: 2,
    kind: "merge" as const,
    actor: "Owen Fitzgerald",
    initials: "OF",
    text: "merged “Fix invoice rounding” into main",
    time: "32m",
    unread: true,
  },
  {
    id: 3,
    kind: "comment" as const,
    actor: "Mei Tanaka",
    initials: "MT",
    image: "/placeholder.svg",
    text: "replied: “Let's ship the flag to 10% first.”",
    time: "1h",
    unread: true,
  },
  {
    id: 4,
    kind: "like" as const,
    actor: "Carlos Mendes",
    initials: "CM",
    text: "reacted to your release notes",
    time: "3h",
    unread: false,
  },
  {
    id: 5,
    kind: "join" as const,
    actor: "Ingrid Solberg",
    initials: "IS",
    text: "joined the Growth workspace",
    time: "Yesterday",
    unread: false,
  },
];

export default function Avatar12() {
  const [notifications, setNotifications] =
    React.useState(initialNotifications);
  const unreadCount = notifications.filter((item) => item.unread).length;

  function markRead(id: number) {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  }

  return (
    <section
      aria-labelledby="avatar-12-title"
      className="w-full max-w-sm overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md"
    >
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h3 id="avatar-12-title" className="text-sm font-medium">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground tabular-nums">
              {unreadCount}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </h3>
        <Button
          variant="ghost"
          size="xs"
          disabled={unreadCount === 0}
          onClick={() =>
            setNotifications((current) =>
              current.map((item) => ({ ...item, unread: false })),
            )
          }
        >
          Mark all as read
        </Button>
      </header>
      <ul className="max-h-96 divide-y overflow-y-auto">
        {notifications.map((item) => {
          const kind = kinds[item.kind];
          const Icon = kind.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => markRead(item.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <Avatar size="lg">
                  {item.image && <AvatarImage src={item.image} alt="" />}
                  <AvatarFallback>{item.initials}</AvatarFallback>
                  <AvatarBadge
                    className={`-right-1 -bottom-1 size-5! text-background ${kind.tone} [&>svg]:size-3!`}
                  >
                    <Icon aria-hidden="true" />
                  </AvatarBadge>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm leading-snug">
                    <span className="font-medium">{item.actor}</span>{" "}
                    <span className="text-muted-foreground">{item.text}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {kind.label} · {item.time}
                  </span>
                </span>
                {item.unread && (
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                    role="img"
                    aria-label="Unread"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
