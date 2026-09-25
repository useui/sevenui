"use client";

import * as React from "react";
import { cn } from "cn";
import {
  AtSignIcon,
  BellIcon,
  CheckCheckIcon,
  GitPullRequestIcon,
  ReceiptIcon,
  UserPlusIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Notification = {
  id: string;
  icon: typeof BellIcon;
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
    icon: AtSignIcon,
    actor: "Lena Fischer",
    action: "mentioned you in",
    target: "Pricing page copy review",
    time: "4 min ago",
    mention: true,
    unread: true,
  },
  {
    id: "n2",
    icon: GitPullRequestIcon,
    actor: "Marcus Hale",
    action: "requested your review on",
    target: "PR 482: Retry failed webhooks",
    time: "38 min ago",
    mention: true,
    unread: true,
  },
  {
    id: "n3",
    icon: UserPlusIcon,
    actor: "Aiko Tanaka",
    action: "joined",
    target: "Design Systems",
    time: "2 h ago",
    mention: false,
    unread: true,
  },
  {
    id: "n4",
    icon: ReceiptIcon,
    actor: "Billing",
    action: "sent the September invoice for",
    target: "$1,240.00",
    time: "Yesterday",
    mention: false,
    unread: false,
  },
];

export default function Popover09() {
  const [items, setItems] = React.useState(initialNotifications);
  const [filter, setFilter] = React.useState("all");

  const unreadCount = items.filter((item) => item.unread).length;
  const visible =
    filter === "mentions" ? items.filter((item) => item.mention) : items;

  function markRead(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );
  }

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
  }

  return (
    <Popover>
      <PopoverTrigger
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
          >
            <BellIcon aria-hidden="true" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-medium text-[10px] text-primary-foreground tabular-nums ring-2 ring-background">
                {unreadCount}
              </span>
            ) : null}
          </Button>
        }
      />
      <PopoverContent
        align="end"
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 p-0"
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
          <PopoverTitle>Notifications</PopoverTitle>
          <Button
            variant="ghost"
            size="xs"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheckIcon aria-hidden="true" />
            Mark all as read
          </Button>
        </div>
        <Tabs value={filter} onValueChange={(value) => setFilter(value)}>
          <TabsList className="mx-4 mb-2 w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
          </TabsList>
          {["all", "mentions"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <ul className="max-h-80 overflow-y-auto border-t">
                {visible.map((item) => (
                  <li key={item.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                        item.unread && "bg-muted/30",
                      )}
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <item.icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm leading-snug">
                          <span className="font-medium">{item.actor}</span>{" "}
                          <span className="text-muted-foreground">
                            {item.action}
                          </span>{" "}
                          <span className="font-medium">{item.target}</span>
                        </span>
                        <span className="mt-1 block text-muted-foreground text-xs">
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
            </TabsContent>
          ))}
        </Tabs>
        <div className="border-t p-1.5">
          <Button variant="ghost" size="sm" className="w-full">
            Notification settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
