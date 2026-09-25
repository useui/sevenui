"use client";

import * as React from "react";
import {
  AtSignIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GitMergeIcon,
  MessageSquareIcon,
  UserPlusIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/registry/base/ui/pagination";

const kindIcon = {
  mention: AtSignIcon,
  comment: MessageSquareIcon,
  merge: GitMergeIcon,
  invite: UserPlusIcon,
};

const initialNotifications: {
  id: number;
  kind: keyof typeof kindIcon;
  text: string;
  time: string;
  unread: boolean;
}[] = [
  { id: 1, kind: "mention", text: "Maya Chen mentioned you in “Q4 pricing review”", time: "4m ago", unread: true },
  { id: 2, kind: "merge", text: "Pull request “Retry webhooks with backoff” was merged", time: "22m ago", unread: true },
  { id: 3, kind: "comment", text: "Diego Alvarez commented on “Onboarding checklist v2”", time: "1h ago", unread: true },
  { id: 4, kind: "invite", text: "Priya Nair joined the Design workspace", time: "3h ago", unread: false },
  { id: 5, kind: "comment", text: "Lena Fischer replied: “Shipping this Thursday works”", time: "5h ago", unread: true },
  { id: 6, kind: "mention", text: "Tom Becker mentioned you in “Incident 2291 postmortem”", time: "Yesterday", unread: false },
  { id: 7, kind: "merge", text: "Pull request “Drop legacy export endpoint” was merged", time: "Yesterday", unread: false },
  { id: 8, kind: "invite", text: "Aiko Tanaka accepted your invite to Growth", time: "Mon", unread: false },
  { id: 9, kind: "comment", text: "Sam Okafor commented on “Churn cohort chart”", time: "Mon", unread: false },
  { id: 10, kind: "mention", text: "Maya Chen mentioned you in “Hiring plan H1”", time: "Sep 18", unread: false },
];

const PAGE_SIZE = 4;

export default function Pagination09() {
  const [notifications, setNotifications] =
    React.useState(initialNotifications);
  const [page, setPage] = React.useState(1);

  const pageCount = Math.ceil(notifications.length / PAGE_SIZE);
  const visible = notifications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const unreadCount = notifications.filter((item) => item.unread).length;

  function markRead(id: number) {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  }

  function goTo(event: React.MouseEvent, next: number) {
    event.preventDefault();
    if (next >= 1 && next <= pageCount) setPage(next);
  }

  const atStart = page === 1;
  const atEnd = page === pageCount;

  return (
    <section
      aria-labelledby="notifications-title"
      className="w-full max-w-sm rounded-xl border bg-popover text-popover-foreground shadow-md"
    >
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h2 id="notifications-title" className="text-sm font-medium">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground tabular-nums">
              {unreadCount}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          disabled={unreadCount === 0}
          onClick={() =>
            setNotifications((current) =>
              current.map((item) => ({ ...item, unread: false })),
            )
          }
        >
          Mark all read
        </Button>
      </header>
      <ul className="min-h-[17rem] divide-y">
        {visible.map((item) => {
          const Icon = kindIcon[item.kind];
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => markRead(item.id)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon aria-hidden="true" className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={
                      item.unread
                        ? "block text-sm font-medium"
                        : "block text-sm text-muted-foreground"
                    }
                  >
                    {item.text}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </span>
                {item.unread && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-primary">
                    <span className="sr-only">Unread</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <footer className="flex items-center justify-between gap-2 border-t px-2 py-2">
        <p
          className="pl-2 text-xs text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          Page {page} of {pageCount}
        </p>
        <Pagination aria-label="Notification pages" className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                aria-label="Newer notifications"
                aria-disabled={atStart}
                tabIndex={atStart ? -1 : undefined}
                className={atStart ? "pointer-events-none opacity-50" : ""}
                onClick={(event) => goTo(event, page - 1)}
              >
                <ChevronLeftIcon aria-hidden="true" className="cn-rtl-flip" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                aria-label="Older notifications"
                aria-disabled={atEnd}
                tabIndex={atEnd ? -1 : undefined}
                className={atEnd ? "pointer-events-none opacity-50" : ""}
                onClick={(event) => goTo(event, page + 1)}
              >
                <ChevronRightIcon aria-hidden="true" className="cn-rtl-flip" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </footer>
    </section>
  );
}
