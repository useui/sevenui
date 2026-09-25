"use client";

import * as React from "react";
import { cn } from "cn";
import { Bell, CheckCheck, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";

type Notification = {
  id: string;
  initials: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  mention: boolean;
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: "n1",
    initials: "PS",
    actor: "Priya Shah",
    action: "mentioned you in",
    target: "Q4 pricing review",
    time: "4 min ago",
    mention: true,
    unread: true,
  },
  {
    id: "n2",
    initials: "DK",
    actor: "Daniel Kim",
    action: "requested your review on",
    target: "Fix invoice rounding (PR 482)",
    time: "38 min ago",
    mention: false,
    unread: true,
  },
  {
    id: "n3",
    initials: "LM",
    actor: "Lena Morales",
    action: "replied to your comment in",
    target: "Onboarding checklist copy",
    time: "2 h ago",
    mention: true,
    unread: true,
  },
  {
    id: "n4",
    initials: "TO",
    actor: "Tom Okafor",
    action: "shared",
    target: "March churn analysis",
    time: "Yesterday",
    mention: false,
    unread: false,
  },
  {
    id: "n5",
    initials: "AR",
    actor: "Aisha Rahman",
    action: "assigned you to",
    target: "Migrate billing webhooks",
    time: "Mon",
    mention: false,
    unread: false,
  },
];

export default function Sheet08() {
  const [notifications, setNotifications] =
    React.useState(initialNotifications);
  const [filter, setFilter] = React.useState("all");

  const unreadCount = notifications.filter((item) => item.unread).length;
  const visible =
    filter === "mentions"
      ? notifications.filter((item) => item.mention)
      : notifications;

  const markRead = (id: string) =>
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );

  const markAllRead = () =>
    setNotifications((items) =>
      items.map((item) => ({ ...item, unread: false })),
    );

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          />
        }
      >
        <Bell aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-medium text-primary-foreground tabular-nums"
          >
            {unreadCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader className="gap-1 border-b pr-12">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            {unreadCount > 0
              ? `You have ${unreadCount} unread ${unreadCount === 1 ? "update" : "updates"}.`
              : "You're all caught up."}
          </SheetDescription>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Tabs value={filter} onValueChange={(value) => setFilter(value)}>
              <TabsList>
                <TabsTrigger value="all" className="flex-none px-2.5">
                  All
                </TabsTrigger>
                <TabsTrigger value="mentions" className="flex-none px-2.5">
                  Mentions
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck aria-hidden="true" data-icon="inline-start" />
              Mark all read
            </Button>
          </div>
        </SheetHeader>
        <ul className="flex-1 overflow-y-auto" aria-label="Notification list">
          {visible.map((item) => (
            <li key={item.id} className="border-b last:border-b-0">
              <button
                type="button"
                onClick={() => markRead(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  item.unread && "bg-accent/40",
                )}
              >
                <Avatar>
                  <AvatarFallback>{item.initials}</AvatarFallback>
                </Avatar>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="text-sm leading-snug text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {item.actor}
                    </span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-foreground">
                      {item.target}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </span>
                {item.unread ? (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                    <span className="sr-only">Unread</span>
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        <SheetFooter className="border-t">
          <SheetClose
            render={
              <Button variant="outline" className="w-full">
                <Settings aria-hidden="true" data-icon="inline-start" />
                Notification settings
              </Button>
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
