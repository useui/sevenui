"use client";

import * as React from "react";
import {
  BellIcon,
  CheckIcon,
  GitPullRequestIcon,
  MessageSquareIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

type Notice = {
  id: string;
  icon: React.ComponentType;
  title: string;
  detail: string;
  time: string;
  day: "Today" | "Yesterday";
};

const notices: Notice[] = [
  {
    id: "n1",
    icon: MessageSquareIcon,
    title: "Lena commented on Q4 roadmap",
    detail: "“Can we move the SSO work before the pricing launch?”",
    time: "11:42",
    day: "Today",
  },
  {
    id: "n2",
    icon: GitPullRequestIcon,
    title: "Review requested on PR 1289",
    detail: "Add rate limiting to the export endpoint",
    time: "10:05",
    day: "Today",
  },
  {
    id: "n3",
    icon: BellIcon,
    title: "Invoice INV-2093 was paid",
    detail: "Northwind Traders · $2,400.00",
    time: "17:30",
    day: "Yesterday",
  },
  {
    id: "n4",
    icon: MessageSquareIcon,
    title: "Theo mentioned you in Design sync",
    detail: "“@you the empty state copy is ready for review.”",
    time: "14:12",
    day: "Yesterday",
  },
];

export default function Marker07() {
  // The first `unreadCount` notices are unread; the rest were already seen.
  const [unreadCount, setUnreadCount] = React.useState(3);
  const days = ["Today", "Yesterday"] as const;

  return (
    <section
      aria-labelledby="marker-07-title"
      className="flex w-full max-w-sm flex-col rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
        <h3 id="marker-07-title" className="text-sm font-medium">
          Notifications
        </h3>
        <Button
          variant="ghost"
          size="xs"
          disabled={unreadCount === 0}
          onClick={() => setUnreadCount(0)}
        >
          <CheckIcon data-icon="inline-start" aria-hidden="true" />
          Mark all read
        </Button>
      </header>

      <div className="flex flex-col gap-1 px-4 pb-4">
        {days.map((day) => (
          <div key={day} className="flex flex-col">
            <Marker variant="separator" className="py-2 text-xs">
              <MarkerContent>{day}</MarkerContent>
            </Marker>
            <ul className="flex flex-col">
              {notices
                .filter((notice) => notice.day === day)
                .map((notice) => {
                  const index = notices.indexOf(notice);
                  const unread = index < unreadCount;
                  const Icon = notice.icon;
                  return (
                    <li key={notice.id} className="flex flex-col">
                      <div className="flex gap-3 py-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-3.5"
                        >
                          <Icon />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <p
                            className={
                              unread
                                ? "text-sm font-medium"
                                : "text-sm text-muted-foreground"
                            }
                          >
                            {notice.title}
                            {unread && (
                              <span className="sr-only"> (unread)</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {notice.detail}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {notice.time}
                        </span>
                      </div>
                      {unreadCount > 0 && index === unreadCount - 1 && (
                        <Marker variant="border" className="text-xs">
                          <MarkerIcon>
                            <CheckIcon />
                          </MarkerIcon>
                          <MarkerContent>Already read below this line</MarkerContent>
                        </Marker>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
        {unreadCount === 0 && (
          <Marker role="status" className="pt-2 text-xs">
            <MarkerIcon>
              <CheckIcon />
            </MarkerIcon>
            <MarkerContent>All notifications marked as read</MarkerContent>
          </Marker>
        )}
      </div>
    </section>
  );
}
